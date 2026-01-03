import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  InsertClient,
  clients,
  InsertSale,
  sales,
  InsertProduct,
  products,
  InsertInstallment,
  installments,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Clients queries
export async function getClientsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(clients)
    .where(eq(clients.userId, userId))
    .orderBy(desc(clients.createdAt));
}

export async function getClientById(clientId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(clients)
    .where(eq(clients.id, clientId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createClient(data: InsertClient) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(clients).values(data);
  return result;
}

export async function updateClient(clientId: number, data: Partial<InsertClient>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .update(clients)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(clients.id, clientId));
}

export async function deleteClient(clientId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(clients).where(eq(clients.id, clientId));
}

// Sales queries
export async function getSalesByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(sales)
    .where(eq(sales.userId, userId))
    .orderBy(desc(sales.createdAt));
}

export async function getSaleById(saleId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(sales)
    .where(eq(sales.id, saleId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createSale(data: InsertSale) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(sales).values(data);
  return result;
}

export async function updateSale(saleId: number, data: Partial<InsertSale>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .update(sales)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(sales.id, saleId));
}

export async function deleteSale(saleId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Delete related products and installments first
  await db.delete(products).where(eq(products.saleId, saleId));
  await db.delete(installments).where(eq(installments.saleId, saleId));
  return db.delete(sales).where(eq(sales.id, saleId));
}

// Products queries
export async function getProductsBySaleId(saleId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(products)
    .where(eq(products.saleId, saleId))
    .orderBy(products.createdAt);
}

export async function createProduct(data: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(products).values(data);
  return result;
}

// Installments queries
export async function getInstallmentsBySaleId(saleId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(installments)
    .where(eq(installments.saleId, saleId))
    .orderBy(installments.number);
}

export async function getInstallmentsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: installments.id,
      saleId: installments.saleId,
      number: installments.number,
      dueDate: installments.dueDate,
      amount: installments.amount,
      status: installments.status,
      paidAt: installments.paidAt,
      contacted: installments.contacted,
      createdAt: installments.createdAt,
      updatedAt: installments.updatedAt,
      clientName: clients.name,
    })
    .from(installments)
    .innerJoin(sales, eq(installments.saleId, sales.id))
    .innerJoin(clients, eq(sales.clientId, clients.id))
    .where(eq(sales.userId, userId))
    .orderBy(desc(installments.dueDate));
}

export async function createInstallment(data: InsertInstallment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(installments).values(data);
  return result;
}

export async function updateInstallmentStatus(
  installmentId: number,
  status: "pending" | "paid" | "overdue",
  paidAt?: Date
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .update(installments)
    .set({ status, paidAt, updatedAt: new Date() })
    .where(eq(installments.id, installmentId));
}

export async function deleteInstallment(installmentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(installments).where(eq(installments.id, installmentId));
}

// Get client sales history
export async function getClientSalesHistory(clientId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(sales)
    .where(eq(sales.clientId, clientId))
    .orderBy(desc(sales.date));
}

// Get clients with installments due soon (within next 7 days)
export async function getClientsWithDueInstallments(userId: number, daysAhead: number = 7) {
  const db = await getDb();
  if (!db) return [];
  
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const futureDate = new Date(now);
  futureDate.setDate(futureDate.getDate() + daysAhead);
  futureDate.setHours(23, 59, 59, 999);

  return db
    .select({
      clientId: clients.id,
      clientName: clients.name,
      clientPhone: clients.phone,
      installmentId: installments.id,
      installmentNumber: installments.number,
      dueDate: installments.dueDate,
      amount: installments.amount,
      status: installments.status,
      contacted: installments.contacted,
      saleId: installments.saleId,
    })
    .from(installments)
    .innerJoin(sales, eq(installments.saleId, sales.id))
    .innerJoin(clients, eq(sales.clientId, clients.id))
    .where(
      and(
        eq(sales.userId, userId),
        eq(installments.status, "pending"),
        gte(installments.dueDate, now),
        lte(installments.dueDate, futureDate)
      )
    )
    .orderBy(installments.dueDate);
}

// Update contacted status for an installment
export async function updateInstallmentContacted(installmentId: number, contacted: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .update(installments)
    .set({ contacted: contacted ? 1 : 0, updatedAt: new Date() })
    .where(eq(installments.id, installmentId));
}
