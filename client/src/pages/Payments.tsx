import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Check,
  Loader2,
  AlertCircle,
  Trash2,
  ChevronRight,
  Search,
  AlertTriangle,
  FileDown,
} from "lucide-react";
import { toast } from "sonner";
import {
  ExportReportModal,
  ExportFilters,
} from "@/components/ExportReportModal";
import { generatePaymentsPDF, downloadPDF } from "@/lib/pdfGenerator";

type FilterType = "all" | "pending" | "paid" | "overdue";

export default function Payments() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [clientSearch, setClientSearch] = useState("");
  const [selectedInstallmentId, setSelectedInstallmentId] = useState<
    number | null
  >(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Queries
  const {
    data: installments = [] as any[],
    isLoading,
    refetch,
  } = trpc.installments.list.useQuery();
  const { data: sales = [] } = trpc.sales.list.useQuery();
  const { data: clients = [] } = trpc.clients.list.useQuery();
  const { data: products = [] } = trpc.products.getBySaleId.useQuery(
    {
      saleId: selectedInstallmentId
        ? installments.find(i => i.id === selectedInstallmentId)?.saleId || 0
        : 0,
    },
    { enabled: selectedInstallmentId !== null }
  );

  // Mutations
  const markAsPaidMutation = trpc.installments.markAsPaid.useMutation({
    onSuccess: () => {
      toast.success("Parcela marcada como paga!");
      refetch();
    },
    onError: error => {
      toast.error(error.message || "Erro ao marcar como pago");
    },
  });

  const deleteInstallmentMutation = trpc.installments.delete.useMutation({
    onSuccess: () => {
      toast.success("Parcela excluida com sucesso!");
      refetch();
    },
    onError: error => {
      toast.error(error.message || "Erro ao excluir parcela");
    },
  });

  const sendNotificationMutation =
    trpc.installments.sendNotification.useMutation({
      onSuccess: () => {
        toast.success("Notificacao enviada via WhatsApp!");
      },
      onError: error => {
        toast.error(error.message || "Erro ao enviar notificacao");
      },
    });

  const updateStatusMutation = trpc.installments.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status atualizado!");
      refetch();
    },
    onError: error => {
      toast.error(error.message || "Erro ao atualizar status");
    },
  });

  const handleExportPDF = async (filters: ExportFilters) => {
    setIsExporting(true);
    try {
      let filteredInstallments = installments;

      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        filteredInstallments = filteredInstallments.filter(
          inst => new Date(inst.dueDate) >= startDate
        );
      }
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        filteredInstallments = filteredInstallments.filter(
          inst => new Date(inst.dueDate) <= endDate
        );
      }

      if (filters.clientId) {
        filteredInstallments = filteredInstallments.filter(inst => {
          const sale = sales.find(s => s.id === inst.saleId);
          return sale?.clientId === filters.clientId;
        });
      }

      const clientsMap = clients.reduce(
        (acc, client) => {
          acc[client.id] = client.name;
          return acc;
        },
        {} as Record<number, string>
      );

      const doc = generatePaymentsPDF(
        filteredInstallments,
        clientsMap,
        filters.startDate ? new Date(filters.startDate) : undefined,
        filters.endDate ? new Date(filters.endDate) : undefined
      );

      const filename = `relatorio_pagamentos_${new Date().toISOString().split("T")[0]}.pdf`;
      downloadPDF(doc, filename);
      toast.success("Relatório exportado com sucesso!");
    } catch (error) {
      toast.error("Erro ao exportar relatório");
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  // Filter installments
  const filteredInstallments = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    return installments.filter(inst => {
      // Filter by status
      if (filter === "all") {
        // Continue to client search filter
      } else if (filter === "paid") {
        if (inst.status !== "paid") return false;
      } else if (filter === "pending") {
        if (inst.status !== "pending") return false;
      } else if (filter === "overdue") {
        const dueDate = new Date(inst.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        if (!(inst.status === "pending" && dueDate < now)) return false;
      }

      // Filter by client name
      if (clientSearch.trim()) {
        const searchLower = clientSearch.toLowerCase();
        if (!inst.clientName.toLowerCase().includes(searchLower)) return false;
      }

      return true;
    });
  }, [installments, filter, clientSearch]);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "N/A";
    return new Intl.DateTimeFormat("pt-BR").format(new Date(date));
  };

  const getStatusBadge = (status: string, dueDate: Date | string) => {
    if (status === "paid") {
      return <Badge className="bg-green-500 text-white">Pago</Badge>;
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);

    if (due < now) {
      return <Badge className="bg-red-500 text-white">Atrasado</Badge>;
    }

    return <Badge className="bg-yellow-500 text-white">Pendente</Badge>;
  };

  const isOverdue = (dueDate: Date | string, status: string) => {
    if (status === "paid") return false;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return due < now;
  };

  const selectedInstallment = installments.find(
    i => i.id === selectedInstallmentId
  );
  const selectedSale = selectedInstallment
    ? sales.find(s => s.id === selectedInstallment.saleId)
    : null;

  // Calculate statistics
  const stats = useMemo(() => {
    const total = installments.reduce((sum, inst) => sum + inst.amount, 0);
    const paid = installments
      .filter(i => i.status === "paid")
      .reduce((sum, inst) => sum + inst.amount, 0);
    const pending = installments
      .filter(i => i.status === "pending")
      .reduce((sum, inst) => sum + inst.amount, 0);

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const overdue = installments
      .filter(i => {
        const due = new Date(i.dueDate);
        due.setHours(0, 0, 0, 0);
        return i.status === "pending" && due < now;
      })
      .reduce((sum, inst) => sum + inst.amount, 0);

    return { total, paid, pending, overdue };
  }, [installments]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pagamentos</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas parcelas e pagamentos
          </p>
        </div>
        <Button
          onClick={() => setIsExportModalOpen(true)}
          variant="outline"
          className="gap-2"
          disabled={installments.length === 0}
        >
          <FileDown className="w-4 h-4" />
          Exportar PDF
        </Button>
      </div>

      {/* Export Modal */}
      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExportPDF}
        type="payments"
        clients={clients}
        isLoading={isExporting}
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold text-foreground mt-2">
            {formatCurrency(stats.total)}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {installments.length} parcelas
          </p>
        </Card>
        <Card className="p-4 border-green-200 bg-green-50 dark:bg-green-950/20">
          <p className="text-sm text-green-700 dark:text-green-400">Pagos</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">
            {formatCurrency(stats.paid)}
          </p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-2">
            {installments.filter(i => i.status === "paid").length} parcelas
          </p>
        </Card>
        <Card className="p-4 border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
          <p className="text-sm text-yellow-700 dark:text-yellow-400">
            Pendentes
          </p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">
            {formatCurrency(stats.pending)}
          </p>
          <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
            {installments.filter(i => i.status === "pending").length} parcelas
          </p>
        </Card>
        <Card className="p-4 border-red-200 bg-red-50 dark:bg-red-950/20">
          <p className="text-sm text-red-700 dark:text-red-400">Atrasados</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-2">
            {formatCurrency(stats.overdue)}
          </p>
          <p className="text-xs text-red-600 dark:text-red-400 mt-2">
            {installments.filter(i => isOverdue(i.dueDate, i.status)).length}{" "}
            parcelas
          </p>
        </Card>
      </div>

      {/* Filters */}
      <div className="w-full flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Input
            placeholder="Buscar por cliente..."
            value={clientSearch}
            onChange={e => setClientSearch(e.target.value)}
            className="w-full pl-10"
          />
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        </div>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value as FilterType)}
          className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
        >
          <option value="all">Todos</option>
          <option value="pending">Pendentes</option>
          <option value="paid">Pagos</option>
          <option value="overdue">Atrasados</option>
        </select>
      </div>

      {/* Installments List */}
      <div className="w-full">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredInstallments.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Nenhuma parcela encontrada</p>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/50">
                  <tr className="text-left">
                    <th className="px-4 py-3 font-medium text-muted-foreground">
                      Cliente
                    </th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">
                      Parcela
                    </th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">
                      Vencimento
                    </th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">
                      Valor
                    </th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="px-4 py-3 font-medium text-muted-foreground text-right">
                      Detalhes
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInstallments.map(installment => {
                    const sale = sales.find(s => s.id === installment.saleId);
                    const isOverdueStatus = isOverdue(
                      installment.dueDate,
                      installment.status
                    );

                    return (
                      <tr
                        key={installment.id}
                        className={`border-b last:border-0 ${
                          isOverdueStatus
                            ? "bg-red-50 dark:bg-red-950/20"
                            : "hover:bg-muted/30"
                        } cursor-pointer`}
                        onClick={() => setSelectedInstallmentId(installment.id)}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">
                              {installment.clientName}
                            </span>
                            {isOverdueStatus && (
                              <AlertTriangle className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          #{installment.number}
                        </td>
                        <td className="px-4 py-3">
                          {formatDate(installment.dueDate)}
                        </td>
                        <td className="px-4 py-3 font-semibold text-foreground">
                          {formatCurrency(installment.amount)}
                        </td>
                        <td className="px-4 py-3">
                          {getStatusBadge(
                            installment.status,
                            installment.dueDate
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={e => {
                              e.stopPropagation();
                              setSelectedInstallmentId(installment.id);
                            }}
                            aria-label={`Ver detalhes da parcela ${installment.number}`}
                          >
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* Detail Modal */}
      <Dialog
        open={selectedInstallmentId !== null}
        onOpenChange={() => setSelectedInstallmentId(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Parcela</DialogTitle>
          </DialogHeader>

          {selectedInstallment && (
            <div className="space-y-6">
              {/* Installment Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">
                  Informações da Parcela
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Cliente</p>
                    <p className="font-semibold text-foreground">
                      {selectedInstallment.clientName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Parcela</p>
                    <p className="font-semibold text-foreground">
                      {selectedInstallment.number}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Valor</p>
                    <p className="font-semibold text-foreground">
                      {formatCurrency(selectedInstallment.amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Vencimento</p>
                    <p className="font-semibold text-foreground">
                      {formatDate(selectedInstallment.dueDate)}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Status</p>
                    {getStatusBadge(
                      selectedInstallment.status,
                      selectedInstallment.dueDate
                    )}
                  </div>
                </div>
              </div>

              {/* Sale Info */}
              {selectedSale && (
                <div className="space-y-4 border-t pt-4">
                  <h3 className="font-semibold text-foreground">
                    Informações da Venda
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Data</p>
                      <p className="font-semibold text-foreground">
                        {formatDate(selectedSale.date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="font-semibold text-foreground">
                        {formatCurrency(selectedSale.total)}
                      </p>
                    </div>
                  </div>

                  {/* Products */}
                  {products.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Produtos</p>
                      {products.map(product => (
                        <div
                          key={product.id}
                          className="flex justify-between text-sm"
                        >
                          <span>{product.description}</span>
                          <span className="text-muted-foreground">
                            {product.quantity}x {formatCurrency(product.price)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 border-t pt-4 flex-wrap">
                {selectedInstallment.status !== "paid" && (
                  <Button
                    onClick={() => {
                      markAsPaidMutation.mutate({ id: selectedInstallment.id });
                      setSelectedInstallmentId(null);
                    }}
                    className="flex-1 gap-2"
                    disabled={markAsPaidMutation.isPending}
                  >
                    <Check className="w-4 h-4" />
                    {markAsPaidMutation.isPending
                      ? "Processando..."
                      : "Marcar como Pago"}
                  </Button>
                )}
                <Button
                  onClick={() => {
                    const client = clients.find(
                      c => c.id === selectedSale?.clientId
                    );
                    if (!client?.whatsappEnabled) {
                      toast.error(
                        "WhatsApp nao esta habilitado para este cliente"
                      );
                      return;
                    }
                    if (!client?.phone) {
                      toast.error("Cliente nao possui telefone cadastrado");
                      return;
                    }
                    sendNotificationMutation.mutate({
                      installmentId: selectedInstallment.id,
                    });
                  }}
                  variant="outline"
                  className="gap-2"
                  disabled={
                    sendNotificationMutation.isPending ||
                    !clients.find(c => c.id === selectedSale?.clientId)
                      ?.whatsappEnabled
                  }
                >
                  {sendNotificationMutation.isPending
                    ? "Enviando..."
                    : "Enviar WhatsApp"}
                </Button>
                <Button
                  onClick={() => {
                    deleteInstallmentMutation.mutate({
                      id: selectedInstallment.id,
                    });
                    setSelectedInstallmentId(null);
                  }}
                  variant="destructive"
                  className="gap-2"
                  disabled={deleteInstallmentMutation.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                  {deleteInstallmentMutation.isPending
                    ? "Deletando..."
                    : "Deletar"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
