import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Loader2, Calendar, FileDown } from "lucide-react";
import { toast } from "sonner";
import {
  ExportReportModal,
  ExportFilters,
} from "@/components/ExportReportModal";
import { generateSalesPDF, downloadPDF } from "@/lib/pdfGenerator";
import {
  parseCommaDecimal,
  formatDecimal,
  formatCurrencyInput,
  formatCurrencyInputRightToLeft,
} from "@/lib/currencyUtils";

interface Product {
  description: string;
  price: number;
  quantity: number;
}

interface Installment {
  number: number;
  dueDate: string;
  amount: number;
}

interface Sale {
  id: number;
  clientId: number;
  clientName: string;
  date: Date | string;
  total: number;
  paymentType: "cash" | "installment";
  installmentCount: number;
}

export default function Sales() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [saleDate, setSaleDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [paymentType, setPaymentType] = useState<"cash" | "installment">(
    "cash"
  );
  const [installmentCount, setInstallmentCount] = useState(1);
  const [products, setProducts] = useState<Product[]>([
    { description: "", price: NaN, quantity: 1 },
  ]);
  const [installments, setInstallments] = useState<Installment[]>([
    { number: 1, dueDate: "", amount: NaN },
  ]);
  const [productInputs, setProductInputs] = useState<Record<number, string>>(
    {}
  );
  const [installmentInputs, setInstallmentInputs] = useState<
    Record<number, string>
  >({});

  // Queries
  const { data: clients = [], isLoading: clientsLoading } =
    trpc.clients.list.useQuery();
  const {
    data: sales = [],
    isLoading: salesLoading,
    refetch: refetchSales,
  } = trpc.sales.list.useQuery();

  // Mutations
  const deleteSaleMutation = trpc.sales.delete.useMutation({
    onSuccess: () => {
      toast.success("Venda excluida com sucesso!");
      refetchSales();
    },
    onError: error => {
      toast.error(error.message || "Erro ao excluir venda");
    },
  });

  const createSaleMutation = trpc.sales.create.useMutation({
    onSuccess: () => {
      toast.success("Venda registrada com sucesso!");
      resetForm();
      setIsDialogOpen(false);
      refetchSales();
    },
    onError: error => {
      toast.error(error.message || "Erro ao registrar venda");
    },
  });

  const resetForm = () => {
    setSelectedClientId("");
    setSaleDate(new Date().toISOString().split("T")[0]);
    setPaymentType("cash");
    setInstallmentCount(1);
    setProducts([{ description: "", price: NaN, quantity: 1 }]);
    setInstallments([{ number: 1, dueDate: "", amount: NaN }]);
    setProductInputs({});
    setInstallmentInputs({});
  };

  const calculateTotal = () => {
    return products.reduce((sum, p) => {
      const price = isNaN(p.price) ? 0 : p.price;
      return sum + price * p.quantity;
    }, 0);
  };

  const handleAddProduct = () => {
    setProducts([...products, { description: "", price: NaN, quantity: 1 }]);
  };

  const handleRemoveProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index));
    const newInputs = { ...productInputs };
    delete newInputs[index];
    setProductInputs(newInputs);
  };

  const handleExportPDF = async (filters: ExportFilters) => {
    setIsExporting(true);
    try {
      let filteredSales = sales;

      // Filter by date range
      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        filteredSales = filteredSales.filter(
          sale => new Date(sale.date) >= startDate
        );
      }
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        filteredSales = filteredSales.filter(
          sale => new Date(sale.date) <= endDate
        );
      }

      // Filter by client
      if (filters.clientId) {
        filteredSales = filteredSales.filter(
          sale => sale.clientId === filters.clientId
        );
      }

      const clientName = filters.clientId
        ? clients.find(c => c.id === filters.clientId)?.name
        : undefined;

      const salesWithClientName = filteredSales.map(sale => ({
        ...sale,
        clientName:
          clients.find(c => c.id === sale.clientId)?.name || "Cliente",
      }));

      const doc = generateSalesPDF(
        salesWithClientName,
        filters.startDate ? new Date(filters.startDate) : undefined,
        filters.endDate ? new Date(filters.endDate) : undefined,
        clientName
      );

      const filename = `relatorio_vendas_${new Date().toISOString().split("T")[0]}.pdf`;
      downloadPDF(doc, filename);
      toast.success("Relatório exportado com sucesso!");
    } catch (error) {
      toast.error("Erro ao exportar relatório");
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleProductChange = (
    index: number,
    field: keyof Product,
    value: string | number
  ) => {
    const newProducts = [...products];
    if (field === "price") {
      const previousValue = productInputs[index] || "0,00";
      const formatted = formatCurrencyInputRightToLeft(
        String(value),
        previousValue
      );
      setProductInputs({ ...productInputs, [index]: formatted });
      newProducts[index][field] = parseCommaDecimal(formatted);
    } else if (field === "quantity") {
      newProducts[index][field] = Number(value);
    } else {
      newProducts[index][field] = value as string;
    }
    setProducts(newProducts);
  };

  const handleAddInstallment = () => {
    const newNumber = installments.length + 1;
    setInstallments([
      ...installments,
      { number: newNumber, dueDate: "", amount: NaN },
    ]);
  };

  const handleRemoveInstallment = (index: number) => {
    setInstallments(installments.filter((_, i) => i !== index));
  };

  const handleInstallmentChange = (
    index: number,
    field: keyof Installment,
    value: string | number
  ) => {
    const newInstallments = [...installments];
    if (field === "amount") {
      const previousValue = installmentInputs[index] || "0,00";
      const formatted = formatCurrencyInputRightToLeft(
        String(value),
        previousValue
      );
      setInstallmentInputs({ ...installmentInputs, [index]: formatted });
      const newAmount = parseCommaDecimal(formatted);
      newInstallments[index][field] = newAmount;

      // Calcula o valor restante e distribui nas outras parcelas vazias
      if (paymentType === "installment") {
        const total = calculateTotal();
        const currentTotal = newInstallments.reduce((sum, inst, idx) => {
          if (idx === index) return sum + newAmount;
          const amount = isNaN(inst.amount) ? 0 : inst.amount;
          return sum + amount;
        }, 0);

        const remaining = total - currentTotal;

        if (remaining > 0.01) {
          // Encontra parcelas vazias (sem valor ou com valor 0)
          const emptyInstallments = newInstallments
            .map((inst, idx) => ({ inst, idx }))
            .filter(
              ({ inst, idx }) =>
                idx !== index && (isNaN(inst.amount) || inst.amount === 0)
            );

          if (emptyInstallments.length > 0) {
            // Distribui o restante igualmente nas parcelas vazias
            const amountPerInstallment = remaining / emptyInstallments.length;

            emptyInstallments.forEach(({ idx }) => {
              newInstallments[idx].amount = amountPerInstallment;
              setInstallmentInputs({
                ...installmentInputs,
                [idx]: formatDecimal(amountPerInstallment),
              });
            });
          }
        } else if (remaining < -0.01) {
          // Se o valor digitado excede o total, ajusta para o máximo possível
          const otherTotal = newInstallments.reduce((sum, inst, idx) => {
            if (idx === index) return sum;
            const amount = isNaN(inst.amount) ? 0 : inst.amount;
            return sum + amount;
          }, 0);

          const maxAmount = Math.max(0, total - otherTotal);
          newInstallments[index].amount = maxAmount;
          setInstallmentInputs({
            ...installmentInputs,
            [index]: formatDecimal(maxAmount),
          });
        }
      }
    } else if (field === "number") {
      newInstallments[index][field] = Number(value);
    } else {
      newInstallments[index][field] = value as string;
    }
    setInstallments(newInstallments);
  };

  const handleCreateSale = () => {
    if (!selectedClientId) {
      toast.error("Selecione um cliente");
      return;
    }

    if (products.some(p => !p.description || isNaN(p.price) || p.price <= 0)) {
      toast.error("Todos os produtos devem ter descrição e preço");
      return;
    }

    const total = calculateTotal();
    if (total <= 0) {
      toast.error("O valor total deve ser maior que zero");
      return;
    }

    if (paymentType === "installment") {
      if (
        installments.some(i => !i.dueDate || isNaN(i.amount) || i.amount <= 0)
      ) {
        toast.error("Todas as parcelas devem ter data de vencimento e valor");
        return;
      }

      const installmentTotal = installments.reduce((sum, i) => {
        const amount = isNaN(i.amount) ? 0 : i.amount;
        return sum + amount;
      }, 0);
      if (installmentTotal !== total) {
        toast.error(
          `A soma das parcelas (${formatCurrencyFromReais(installmentTotal)}) deve ser igual ao total (${formatCurrencyFromReais(total)})`
        );
        return;
      }
    }

    // Convert values from reais to cents before saving
    const totalInCents = Math.round(total * 100);

    const processedInstallments =
      paymentType === "installment"
        ? installments.map(i => ({
            number: i.number,
            dueDate: new Date(i.dueDate),
            amount: Math.round(i.amount * 100), // Convert to cents
          }))
        : undefined;

    createSaleMutation.mutate({
      clientId: Number(selectedClientId),
      date: new Date(saleDate),
      total: totalInCents, // Convert to cents
      paymentType,
      installmentCount: paymentType === "installment" ? installments.length : 1,
      products: products.map(p => ({
        description: p.description,
        price: Math.round(p.price * 100), // Convert to cents
        quantity: p.quantity,
      })),
      installments: processedInstallments,
    });
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
  };

  const formatCurrencyFromReais = (reais: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(reais);
  };

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat("pt-BR").format(new Date(date));
  };

  const handleDeleteSale = (saleId: number) => {
    if (confirm("Tem certeza que deseja excluir esta venda?")) {
      deleteSaleMutation.mutate({ id: saleId });
    }
  };

  const total = calculateTotal();
  const installmentTotal = installments.reduce((sum, i) => {
    const amount = isNaN(i.amount) ? 0 : i.amount;
    return sum + amount;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Vendas</h1>
          <p className="text-muted-foreground mt-1">
            Registre e acompanhe suas vendas
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsExportModalOpen(true)}
            variant="outline"
            className="gap-2"
            disabled={sales.length === 0}
          >
            <FileDown className="w-4 h-4" />
            Exportar PDF
          </Button>
          <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Nova Venda
          </Button>
        </div>
      </div>

      {/* Sales List */}
      <div className="space-y-4">
        {salesLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : sales.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              Nenhuma venda registrada ainda
            </p>
            <Button
              onClick={() => setIsDialogOpen(true)}
              variant="outline"
              className="mt-4"
            >
              Registrar Primeira Venda
            </Button>
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr className="border-b border-border">
                  <th className="text-left p-3 font-semibold text-foreground">
                    Data
                  </th>
                  <th className="text-left p-3 font-semibold text-foreground">
                    Cliente
                  </th>
                  <th className="text-left p-3 font-semibold text-foreground">
                    Valor Total
                  </th>
                  <th className="text-left p-3 font-semibold text-foreground">
                    Pagamento
                  </th>
                  <th className="text-left p-3 font-semibold text-foreground">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sales.map(sale => {
                  const client = clients.find(c => c.id === sale.clientId);
                  return (
                    <tr
                      key={sale.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <td className="p-3 text-foreground">
                        {formatDate(sale.date)}
                      </td>
                      <td className="p-3 text-foreground">
                        {client?.name || "—"}
                      </td>
                      <td className="p-3 font-semibold text-foreground">
                        {formatCurrency(sale.total)}
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {sale.paymentType === "cash"
                          ? "À Vista"
                          : `${sale.installmentCount}x`}
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteSale(sale.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Export Modal */}
      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExportPDF}
        type="sales"
        clients={clients}
        isLoading={isExporting}
      />

      {/* Dialog for new sale */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {" "}
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto sm:max-w-sm md:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nova Venda</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Client Selection */}
            <div>
              <label className="text-sm font-medium text-foreground">
                Cliente *
              </label>
              <Select
                value={selectedClientId}
                onValueChange={setSelectedClientId}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientsLoading ? (
                    <div className="p-2 text-center text-sm text-muted-foreground">
                      Carregando clientes...
                    </div>
                  ) : clients.length === 0 ? (
                    <div className="p-2 text-center text-sm text-muted-foreground">
                      Nenhum cliente cadastrado
                    </div>
                  ) : (
                    clients.map(client => (
                      <SelectItem key={client.id} value={String(client.id)}>
                        {client.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Date */}
            <div>
              <label className="text-sm font-medium text-foreground">
                Data da Venda *
              </label>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={saleDate}
                  onChange={e => setSaleDate(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Products */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-medium text-foreground">
                  Produtos *
                </label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAddProduct}
                  className="gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Adicionar
                </Button>
              </div>

              <div className="space-y-4">
                {products.map((product, index) => (
                  <Card key={index} className="p-4 bg-muted/30">
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-foreground">
                          Descrição *
                        </label>
                        <Input
                          placeholder="Digite a descrição do produto"
                          value={product.description}
                          onChange={e =>
                            handleProductChange(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          className="mt-1"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-foreground">
                            Valor *
                          </label>
                          <Input
                            type="text"
                            inputMode="decimal"
                            placeholder="0,00"
                            value={
                              productInputs[index] !== undefined
                                ? productInputs[index]
                                : isNaN(product.price)
                                  ? "0,00"
                                  : formatDecimal(product.price)
                            }
                            onChange={e =>
                              handleProductChange(
                                index,
                                "price",
                                e.target.value
                              )
                            }
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-foreground">
                            Quantidade *
                          </label>
                          <Input
                            type="number"
                            inputMode="numeric"
                            placeholder="1"
                            value={product.quantity}
                            onChange={e =>
                              handleProductChange(
                                index,
                                "quantity",
                                e.target.value
                              )
                            }
                            className="mt-1"
                            min="1"
                          />
                        </div>
                      </div>

                      {products.length > 1 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveProduct(index)}
                          className="w-full text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remover Produto
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Payment Type */}
            <div>
              <label className="text-sm font-medium text-foreground">
                Forma de Pagamento *
              </label>
              <Select
                value={paymentType}
                onValueChange={value =>
                  setPaymentType(value as "cash" | "installment")
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">À Vista</SelectItem>
                  <SelectItem value="installment">Parcelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Installments */}
            {paymentType === "installment" && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium text-foreground">
                    Parcelas *
                  </label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAddInstallment}
                    className="gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Adicionar Parcela
                  </Button>
                </div>

                <div className="space-y-3">
                  {installments.map((installment, index) => (
                    <Card key={index} className="p-4 bg-muted/30">
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="text-xs font-medium text-foreground">
                              Parcela
                            </label>
                            <Input
                              type="number"
                              inputMode="numeric"
                              value={installment.number}
                              onChange={e =>
                                handleInstallmentChange(
                                  index,
                                  "number",
                                  e.target.value
                                )
                              }
                              className="mt-1"
                              min="1"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-foreground">
                              Vencimento *
                            </label>
                            <Input
                              type="date"
                              value={installment.dueDate}
                              onChange={e =>
                                handleInstallmentChange(
                                  index,
                                  "dueDate",
                                  e.target.value
                                )
                              }
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-foreground">
                              Valor *
                            </label>
                            <Input
                              type="text"
                              inputMode="decimal"
                              placeholder="0,00"
                              value={
                                installmentInputs[index] !== undefined
                                  ? installmentInputs[index]
                                  : isNaN(installment.amount)
                                    ? "0,00"
                                    : formatDecimal(installment.amount)
                              }
                              onChange={e =>
                                handleInstallmentChange(
                                  index,
                                  "amount",
                                  e.target.value
                                )
                              }
                              className="mt-1"
                            />
                          </div>
                        </div>

                        {installments.length > 1 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveInstallment(index)}
                            className="w-full text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remover Parcela
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Summary */}
            <Card className="p-4 bg-muted">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium text-foreground">
                    {formatCurrencyFromReais(total)}
                  </span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between">
                  <span className="font-semibold text-foreground">Total:</span>
                  <span className="font-bold text-lg text-foreground">
                    {formatCurrencyFromReais(total)}
                  </span>
                </div>

                {paymentType === "installment" && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm font-medium text-foreground mb-2">
                      Resumo das Parcelas:
                    </p>
                    <div className="space-y-1">
                      {installments.map(inst => {
                        const amount = isNaN(inst.amount) ? 0 : inst.amount;
                        return (
                          <div
                            key={inst.number}
                            className="flex justify-between text-xs text-muted-foreground"
                          >
                            <span>Parcela {inst.number}:</span>
                            <span>
                              {isNaN(inst.amount) || inst.amount === 0
                                ? "—"
                                : `${formatCurrencyFromReais(amount)} - Venc. ${
                                    inst.dueDate
                                      ? formatDate(inst.dueDate)
                                      : "—"
                                  }`}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between text-sm font-semibold text-foreground mt-2 pt-2 border-t border-border">
                      <span>Total Parcelas:</span>
                      <span>{formatCurrencyFromReais(installmentTotal)}</span>
                    </div>
                    {(() => {
                      const remaining = total - installmentTotal;
                      if (remaining > 0.01) {
                        return (
                          <div className="flex justify-between text-sm font-semibold mt-2 pt-2 border-t border-border text-orange-600">
                            <span>Falta:</span>
                            <span>{formatCurrencyFromReais(remaining)}</span>
                          </div>
                        );
                      } else if (remaining < -0.01) {
                        return (
                          <div className="flex justify-between text-sm font-semibold mt-2 pt-2 border-t border-border text-red-600">
                            <span>Excede:</span>
                            <span>
                              {formatCurrencyFromReais(Math.abs(remaining))}
                            </span>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                )}
              </div>
            </Card>

            {/* Actions */}
            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleCreateSale}
                disabled={createSaleMutation.isPending}
              >
                {createSaleMutation.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Registrar Venda
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
