import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, TrendingUp, DollarSign, Clock, AlertCircle } from "lucide-react";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";

export default function Dashboard() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Queries
  const { data: sales = [], isLoading: salesLoading } = trpc.sales.list.useQuery();
  const { data: installments = [], isLoading: installmentsLoading } = trpc.installments.list.useQuery();
  const { data: clients = [], isLoading: clientsLoading } = trpc.clients.list.useQuery();

  const isLoading = salesLoading || installmentsLoading || clientsLoading;

  // Filter sales by period
  const filteredSales = useMemo(() => {
    let filtered = sales;
    
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      filtered = filtered.filter(sale => new Date(sale.date) >= start);
    }
    
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(sale => new Date(sale.date) <= end);
    }
    
    return filtered;
  }, [sales, startDate, endDate]);

  // Calculate financial summary
  const summary = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // Sales summary
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + (sale.total || 0), 0);
    const totalSales = filteredSales.length;

    // Installments summary (all installments, not filtered by date)
    const totalInstallments = installments.length;
    const paidInstallments = installments.filter(i => i.status === "paid").length;
    const pendingInstallments = installments.filter(i => i.status === "pending").length;
    
    const totalReceivable = installments.reduce((sum, inst) => sum + inst.amount, 0);
    const totalPaid = installments
      .filter(i => i.status === "paid")
      .reduce((sum, inst) => sum + inst.amount, 0);
    const totalPending = installments
      .filter(i => i.status === "pending")
      .reduce((sum, inst) => sum + inst.amount, 0);

    // Overdue
    const overdueInstallments = installments.filter(i => {
      const dueDate = new Date(i.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return i.status === "pending" && dueDate < now;
    });
    const totalOverdue = overdueInstallments.reduce((sum, inst) => sum + inst.amount, 0);

    // Upcoming (next 7 days)
    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const upcomingInstallments = installments.filter(i => {
      const dueDate = new Date(i.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return i.status === "pending" && dueDate >= now && dueDate <= sevenDaysFromNow;
    });

    return {
      totalRevenue,
      totalSales,
      totalReceivable,
      totalPaid,
      totalPending,
      totalOverdue,
      paidInstallments,
      pendingInstallments,
      upcomingInstallments,
      overdueInstallments,
    };
  }, [filteredSales, installments]);

  // Prepare data for charts
  const salesByDateData = useMemo(() => {
    const grouped: Record<string, number> = {};
    
    filteredSales.forEach(sale => {
      const date = new Date(sale.date);
      const dateStr = date.toLocaleDateString("pt-BR");
      grouped[dateStr] = (grouped[dateStr] || 0) + sale.total;
    });

    return Object.entries(grouped)
      .map(([date, total]) => ({
        date,
        total: Math.round(total / 100),
      }))
      .sort((a, b) => new Date(a.date.split("/").reverse().join("-")).getTime() - new Date(b.date.split("/").reverse().join("-")).getTime());
  }, [filteredSales]);

  // Payment status data
  const paymentStatusData = useMemo(() => {
    return [
      { name: "Pagos", value: summary.totalPaid, color: "#10b981" },
      { name: "Pendentes", value: summary.totalPending, color: "#f59e0b" },
      { name: "Atrasados", value: summary.totalOverdue, color: "#ef4444" },
    ].filter(item => item.value > 0);
  }, [summary]);

  // Client ranking by sales
  const clientRanking = useMemo(() => {
    const clientSales: Record<number, { name: string; total: number; count: number }> = {};
    
    filteredSales.forEach(sale => {
      if (!clientSales[sale.clientId]) {
        const client = clients.find(c => c.id === sale.clientId);
        clientSales[sale.clientId] = {
          name: client?.name || "Desconhecido",
          total: 0,
          count: 0,
        };
      }
      clientSales[sale.clientId].total += sale.total;
      clientSales[sale.clientId].count += 1;
    });

    return Object.values(clientSales)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .map((client, index) => ({
        ...client,
        rank: index + 1,
        total: Math.round(client.total / 100),
      }));
  }, [filteredSales, clients]);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
  };

  const handleResetFilters = () => {
    setStartDate("");
    setEndDate("");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Resumo financeiro e análise de vendas</p>
      </div>

      {/* Period Filter */}
      <Card className="p-4 border-border">
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground">Filtrar por Período</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">Data Inicial</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Data Final</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleResetFilters}
                variant="outline"
                className="w-full"
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <p className="text-sm text-blue-700 dark:text-blue-400">Receita Total</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">{formatCurrency(summary.totalRevenue)}</p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">{summary.totalSales} vendas</p>
        </Card>
        <Card className="p-4 border-green-200 bg-green-50 dark:bg-green-950/20">
          <p className="text-sm text-green-700 dark:text-green-400">Recebido</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">{formatCurrency(summary.totalPaid)}</p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-2">{summary.paidInstallments} parcelas</p>
        </Card>
        <Card className="p-4 border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
          <p className="text-sm text-yellow-700 dark:text-yellow-400">A Receber</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">{formatCurrency(summary.totalPending)}</p>
          <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">{summary.pendingInstallments} parcelas</p>
        </Card>
        <Card className="p-4 border-red-200 bg-red-50 dark:bg-red-950/20">
          <p className="text-sm text-red-700 dark:text-red-400">Atrasado</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-2">{formatCurrency(summary.totalOverdue)}</p>
          <p className="text-xs text-red-600 dark:text-red-400 mt-2">{summary.overdueInstallments.length} parcelas</p>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Date */}
        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-4">Vendas por Data</h3>
          {salesByDateData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesByDateData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#3b82f6" name="Vendas (R$)" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center py-8">Nenhuma venda no período selecionado</p>
          )}
        </Card>

        {/* Payment Status */}
        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-4">Status de Pagamentos</h3>
          {paymentStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center py-8">Nenhuma parcela registrada</p>
          )}
        </Card>
      </div>

      {/* Client Ranking */}
      <Card className="p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Top 5 Clientes por Vendas
        </h3>
        {clientRanking.length > 0 ? (
          <div className="space-y-3">
            {clientRanking.map((client) => (
              <div key={client.rank} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                    {client.rank}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{client.name}</p>
                    <p className="text-xs text-muted-foreground">{client.count} compra{client.count > 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">{formatCurrency(client.total * 100)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">Nenhuma venda no período selecionado</p>
        )}
      </Card>

      {/* Upcoming Installments */}
      {summary.upcomingInstallments.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Próximas a Vencer (7 dias)
          </h3>
          <div className="space-y-2">
            {summary.upcomingInstallments.map((inst) => (
              <div key={inst.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div>
                  <p className="font-medium text-foreground">{inst.clientName}</p>
                  <p className="text-sm text-muted-foreground">Parcela {inst.number} • Vence em {new Date(inst.dueDate).toLocaleDateString('pt-BR')}</p>
                </div>
                <p className="font-semibold text-foreground">{formatCurrency(inst.amount)}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Overdue Installments */}
      {summary.overdueInstallments.length > 0 && (
        <Card className="p-6 border-red-200 bg-red-50 dark:bg-red-950/20">
          <h3 className="font-semibold text-red-700 dark:text-red-400 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Parcelas Atrasadas
          </h3>
          <div className="space-y-2">
            {summary.overdueInstallments.map((inst) => (
              <div key={inst.id} className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-white dark:bg-red-950/10">
                <div>
                  <p className="font-medium text-foreground">{inst.clientName}</p>
                  <p className="text-sm text-muted-foreground">Parcela {inst.number} • Venceu em {new Date(inst.dueDate).toLocaleDateString('pt-BR')}</p>
                </div>
                <p className="font-semibold text-red-600">{formatCurrency(inst.amount)}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
