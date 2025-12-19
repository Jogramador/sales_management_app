import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  getClientsByUserId,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  getSalesByUserId,
  getSaleById,
  createSale,
  updateSale,
  deleteSale,
  getProductsBySaleId,
  createProduct,
  getInstallmentsBySaleId,
  getInstallmentsByUserId,
  createInstallment,
  updateInstallmentStatus,
  deleteInstallment,
  getClientSalesHistory,
} from "./db";
import { sendWhatsAppMessage, formatInstallmentNotification } from "./whatsapp";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Clients procedures
  clients: router({
    list: protectedProcedure.query(({ ctx }) =>
      getClientsByUserId(ctx.user.id)
    ),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getClientById(input.id)),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1, "Nome é obrigatório"),
          phone: z.string().optional().nullable(),
          notes: z.string().optional(),
          whatsappEnabled: z.number().optional().default(0),
        })
      )
      .mutation(({ ctx, input }) =>
        createClient({
          userId: ctx.user.id,
          name: input.name,
          phone: input.phone || undefined,
          notes: input.notes,
          whatsappEnabled: input.whatsappEnabled,
        })
      ),

    getSalesHistory: protectedProcedure
      .input(z.object({ clientId: z.number() }))
      .query(({ input }) => getClientSalesHistory(input.clientId)),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1),
          phone: z.string().optional().nullable(),
          notes: z.string().optional(),
          whatsappEnabled: z.number().optional(),
        })
      )
      .mutation(({ input }) =>
        updateClient(input.id, {
          name: input.name,
          phone: input.phone || undefined,
          notes: input.notes,
          whatsappEnabled: input.whatsappEnabled,
        })
      ),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteClient(input.id)),
  }),

  // Sales procedures
  sales: router({
    list: protectedProcedure.query(({ ctx }) => getSalesByUserId(ctx.user.id)),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getSaleById(input.id)),

    create: protectedProcedure
      .input(
        z.object({
          clientId: z.number(),
          date: z.date(),
          total: z.number(),
          paymentType: z.enum(["cash", "installment"]),
          installmentCount: z.number().default(1),
          products: z.array(
            z.object({
              description: z.string(),
              price: z.number(),
              quantity: z.number().default(1),
            })
          ),
          installments: z
            .array(
              z.object({
                number: z.number(),
                dueDate: z.date(),
                amount: z.number(),
              })
            )
            .optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Create sale
        const saleResult = await createSale({
          userId: ctx.user.id,
          clientId: input.clientId,
          date: input.date,
          total: input.total,
          paymentType: input.paymentType,
          installmentCount: input.installmentCount,
        });

        const saleId = saleResult[0].insertId;

        // Create products
        for (const product of input.products) {
          await createProduct({
            saleId,
            description: product.description,
            price: product.price,
            quantity: product.quantity,
          });
        }

        // Create installments
        if (input.installments && input.installments.length > 0) {
          for (const installment of input.installments) {
            await createInstallment({
              saleId,
              number: installment.number,
              dueDate: installment.dueDate,
              amount: installment.amount,
            });
          }
        } else if (input.paymentType === "cash") {
          // For cash payments, create a single installment marked as paid
          await createInstallment({
            saleId,
            number: 1,
            dueDate: input.date,
            amount: input.total,
            status: "paid",
            paidAt: new Date(),
          });
        }

        return { id: saleId };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteSale(input.id)),
  }),

  // Products procedures
  products: router({
    getBySaleId: protectedProcedure
      .input(z.object({ saleId: z.number() }))
      .query(({ input }) => getProductsBySaleId(input.saleId)),
  }),

  // Installments procedures
  installments: router({
    list: protectedProcedure.query(({ ctx }) =>
      getInstallmentsByUserId(ctx.user.id)
    ),

    getBySaleId: protectedProcedure
      .input(z.object({ saleId: z.number() }))
      .query(({ input }) => getInstallmentsBySaleId(input.saleId)),

    markAsPaid: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) =>
        updateInstallmentStatus(input.id, "paid", new Date())
      ),

    updateStatus: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["pending", "paid", "overdue"]),
        })
      )
      .mutation(({ input }) =>
        updateInstallmentStatus(
          input.id,
          input.status,
          input.status === "paid" ? new Date() : undefined
        )
      ),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteInstallment(input.id)),

    sendNotification: protectedProcedure
      .input(z.object({ installmentId: z.number() }))
      .mutation(async ({ input }) => {
        const installments = await getInstallmentsByUserId(1);
        const installment = installments.find(i => i.id === input.installmentId);
        if (!installment) throw new Error("Parcela nao encontrada");
        const sale = await getSaleById(installment.saleId);
        if (!sale) throw new Error("Venda nao encontrada");
        const client = await getClientById(sale.clientId);
        if (!client) throw new Error("Cliente nao encontrado");
        if (!client.phone) throw new Error("Cliente nao possui telefone cadastrado");
        const dueDate = new Date(installment.dueDate).toLocaleDateString('pt-BR');
        const message = formatInstallmentNotification(client.name, installment.number, installment.amount, dueDate);
        const success = await sendWhatsAppMessage(client.phone, message);
        return { success, message: success ? "Notificacao enviada!" : "Erro ao enviar" };
      }),
  }),
});

export type AppRouter = typeof appRouter;
