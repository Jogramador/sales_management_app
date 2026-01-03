import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Loader2,
  AlertCircle,
  Phone,
  Calendar,
  DollarSign,
  CheckCircle2,
  XCircle,
  Search,
} from "lucide-react";
import { toast } from "sonner";

export default function Collections() {
  const [clientSearch, setClientSearch] = useState("");
  const [daysAhead, setDaysAhead] = useState(7);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

  const utils = trpc.useUtils();

  // Query for due installments
  const {
    data: dueInstallments = [],
    isLoading,
    refetch,
  } = trpc.collections.getDueInstallments.useQuery({
    daysAhead,
  });

  // Mutation to mark as contacted
  const markAsContactedMutation = trpc.installments.markAsContacted.useMutation({
    onSuccess: () => {
      toast.success("Status de cobrança atualizado!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar status");
    },
  });

  // Group installments by client
  const groupedByClient = useMemo(() => {
    const grouped: Record<
      number,
      {
        clientId: number;
        clientName: string;
        clientPhone: string | null;
        installments: typeof dueInstallments;
      }
    > = {};

    dueInstallments.forEach((inst) => {
      if (!grouped[inst.clientId]) {
        grouped[inst.clientId] = {
          clientId: inst.clientId,
          clientName: inst.clientName,
          clientPhone: inst.clientPhone,
          installments: [],
        };
      }
      grouped[inst.clientId].installments.push(inst);
    });

    return Object.values(grouped);
  }, [dueInstallments]);

  // Filter by client name
  const filteredClients = useMemo(() => {
    if (!clientSearch.trim()) return groupedByClient;

    const searchLower = clientSearch.toLowerCase();
    return groupedByClient.filter((client) =>
      client.clientName.toLowerCase().includes(searchLower)
    );
  }, [groupedByClient, clientSearch]);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
  };

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat("pt-BR").format(new Date(date));
  };

  const getDaysUntilDue = (dueDate: Date | string) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleToggleContacted = (installmentId: number, currentStatus: number) => {
    markAsContactedMutation.mutate({
      id: installmentId,
      contacted: currentStatus === 0,
    });
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const totalAmount = dueInstallments.reduce((sum, inst) => sum + inst.amount, 0);
    const contactedCount = dueInstallments.filter((inst) => inst.contacted === 1).length;
    const notContactedCount = dueInstallments.filter((inst) => inst.contacted === 0).length;

    return { totalAmount, contactedCount, notContactedCount, totalCount: dueInstallments.length };
  }, [dueInstallments]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cobranças</h1>
          <p className="text-muted-foreground mt-1">
            Clientes com parcelas próximas do vencimento
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total a Cobrar</p>
          <p className="text-2xl font-bold text-foreground mt-2">
            {formatCurrency(stats.totalAmount)}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {stats.totalCount} parcelas
          </p>
        </Card>
        <Card className="p-4 border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <p className="text-sm text-blue-700 dark:text-blue-400">Já Cobrados</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">
            {stats.contactedCount}
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
            clientes cobrados
          </p>
        </Card>
        <Card className="p-4 border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
          <p className="text-sm text-yellow-700 dark:text-yellow-400">
            Pendentes de Cobrança
          </p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">
            {stats.notContactedCount}
          </p>
          <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
            clientes a cobrar
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Período</p>
          <p className="text-2xl font-bold text-foreground mt-2">
            {daysAhead} dias
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            próximos vencimentos
          </p>
        </Card>
      </div>

      {/* Filters */}
      <div className="w-full flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Input
            placeholder="Buscar por cliente..."
            value={clientSearch}
            onChange={(e) => setClientSearch(e.target.value)}
            className="w-full pl-10"
          />
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground whitespace-nowrap">
            Próximos:
          </label>
          <Input
            type="number"
            min="1"
            max="30"
            value={daysAhead}
            onChange={(e) => setDaysAhead(Number(e.target.value) || 7)}
            className="w-20"
          />
          <span className="text-sm text-muted-foreground whitespace-nowrap">dias</span>
        </div>
      </div>

      {/* Clients List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredClients.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              Nenhum cliente com parcelas próximas do vencimento
            </p>
          </Card>
        ) : (
          filteredClients.map((client) => {
            const totalAmount = client.installments.reduce(
              (sum, inst) => sum + inst.amount,
              0
            );
            const contactedCount = client.installments.filter(
              (inst) => inst.contacted === 1
            ).length;
            const allContacted = client.installments.every(
              (inst) => inst.contacted === 1
            );

            return (
              <Card
                key={client.clientId}
                className={`p-4 hover:shadow-lg transition-all ${
                  allContacted
                    ? "border-l-4 border-l-green-500 bg-green-50/50 dark:bg-green-950/10"
                    : "border-l-4 border-l-yellow-500"
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-foreground text-lg">
                        {client.clientName}
                      </h3>
                      {allContacted && (
                        <Badge className="bg-green-500 text-white">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Cobrado
                        </Badge>
                      )}
                      {!allContacted && (
                        <Badge className="bg-yellow-500 text-white">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Pendente
                        </Badge>
                      )}
                    </div>
                    {client.clientPhone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        {client.clientPhone}
                      </div>
                    )}
                    <div className="mt-2 flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-semibold text-foreground">
                          {formatCurrency(totalAmount)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {client.installments.length} parcela
                          {client.installments.length > 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Installments List */}
                <div className="space-y-2 mt-4 pt-4 border-t border-border">
                  {client.installments.map((installment) => {
                    const daysUntilDue = getDaysUntilDue(installment.dueDate);
                    const isContacted = installment.contacted === 1;

                    return (
                      <div
                        key={installment.installmentId}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          isContacted
                            ? "bg-green-50 dark:bg-green-950/20"
                            : "bg-muted"
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <Checkbox
                            checked={isContacted}
                            onCheckedChange={() =>
                              handleToggleContacted(
                                installment.installmentId,
                                installment.contacted
                              )
                            }
                            disabled={markAsContactedMutation.isPending}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">
                                Parcela #{installment.installmentNumber}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                • {formatCurrency(installment.amount)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-muted-foreground">
                                Vence em: {formatDate(installment.dueDate)}
                              </span>
                              {daysUntilDue >= 0 && (
                                <Badge
                                  variant="outline"
                                  className={
                                    daysUntilDue <= 2
                                      ? "border-red-500 text-red-600"
                                      : daysUntilDue <= 5
                                      ? "border-yellow-500 text-yellow-600"
                                      : "border-blue-500 text-blue-600"
                                  }
                                >
                                  {daysUntilDue === 0
                                    ? "Hoje"
                                    : daysUntilDue === 1
                                    ? "Amanhã"
                                    : `${daysUntilDue} dias`}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isContacted ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-yellow-500" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
