import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Phone, Plus, ChevronRight, Loader2, Edit2, Trash2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

export default function Clients() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingClientId, setEditingClientId] = useState<number | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    notes: "",
    whatsappEnabled: false,
  });

  const utils = trpc.useUtils();

  // Queries
  const { data: clients = [], isLoading: clientsLoading } = trpc.clients.list.useQuery();
  const { data: salesHistory = [], isLoading: historyLoading } = trpc.clients.getSalesHistory.useQuery(
    { clientId: selectedClientId! },
    { enabled: selectedClientId !== null }
  );

  // Mutations
  const createClientMutation = trpc.clients.create.useMutation({
    onSuccess: () => {
      toast.success("Cliente criado com sucesso!");
      // Fechar o dialog primeiro
      setIsDialogOpen(false);
      // Resetar o formulário
      setFormData({ name: "", phone: "", notes: "", whatsappEnabled: false });
      setIsEditMode(false);
      setEditingClientId(null);
      // Invalidar queries após o dialog ser completamente removido do DOM
      // Usar um pequeno delay para garantir que a animação de fechamento do dialog termine
      setTimeout(() => {
        utils.clients.list.invalidate();
      }, 200);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar cliente");
    },
  });

  const updateClientMutation = trpc.clients.update.useMutation({
    onSuccess: () => {
      toast.success("Cliente atualizado com sucesso!");
      // Fechar o dialog primeiro
      setIsDialogOpen(false);
      // Resetar o formulário
      setFormData({ name: "", phone: "", notes: "", whatsappEnabled: false });
      setIsEditMode(false);
      setEditingClientId(null);
      // Invalidar queries após o dialog ser completamente removido do DOM
      // Usar um pequeno delay para garantir que a animação de fechamento do dialog termine
      setTimeout(() => {
        utils.clients.list.invalidate();
      }, 200);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar cliente");
    },
  });

  const deleteClientMutation = trpc.clients.delete.useMutation({
    onSuccess: () => {
      toast.success("Cliente excluído com sucesso!");
      utils.clients.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao excluir cliente");
    },
  });

  const formatPhoneInput = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
    if (cleaned.length <= 10) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
  };

  const resetForm = () => {
    setFormData({ name: "", phone: "", notes: "", whatsappEnabled: false });
    setIsDialogOpen(false);
    setIsEditMode(false);
    setEditingClientId(null);
  };

  const handleOpenDialog = (client?: any) => {
    if (client) {
      setEditingClientId(client.id);
      setIsEditMode(true);
      setFormData({
        name: client.name,
        phone: client.phone || "",
        notes: client.notes || "",
        whatsappEnabled: client.whatsappEnabled === 1,
      });
    } else {
      setEditingClientId(null);
      setIsEditMode(false);
      setFormData({ name: "", phone: "", notes: "", whatsappEnabled: false });
    }
    setIsDialogOpen(true);
  };

  const handleSaveClient = () => {
    if (!formData.name) {
      toast.error("Nome é obrigatório");
      return;
    }

    if (formData.whatsappEnabled && !formData.phone) {
      toast.error("Telefone é obrigatório quando WhatsApp está ativado");
      return;
    }

    if (isEditMode && editingClientId) {
      updateClientMutation.mutate({
        id: editingClientId,
        name: formData.name,
        phone: formData.phone || null,
        notes: formData.notes,
        whatsappEnabled: formData.whatsappEnabled ? 1 : 0,
      });
    } else {
      createClientMutation.mutate({
        name: formData.name,
        phone: formData.phone || null,
        notes: formData.notes,
        whatsappEnabled: formData.whatsappEnabled ? 1 : 0,
      });
    }
  };

  const handleDeleteClient = (clientId: number) => {
    if (confirm("Tem certeza que deseja excluir este cliente?")) {
      deleteClientMutation.mutate({ id: clientId });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "phone") {
      setFormData((prev) => ({ ...prev, [name]: formatPhoneInput(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR").format(new Date(date));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Clientes</h1>
          <p className="text-muted-foreground mt-1">Gerencie seus clientes e histórico de vendas</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Cliente
        </Button>
      </div>

      {/* Clients List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {clientsLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : clients.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Nenhum cliente cadastrado ainda</p>
            <Button onClick={() => handleOpenDialog()} variant="outline" className="mt-4">
              Cadastrar Primeiro Cliente
            </Button>
          </Card>
        ) : (
          clients.map((client) => (
            <Card
              key={client.id}
              className="p-4 hover:shadow-lg transition-all border-l-4 border-l-blue-500"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{client.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Phone className="w-4 h-4" />
                    {client.phone || "Sem telefone"}
                  </div>
                  {client.whatsappEnabled === 1 && (
                    <div className="flex items-center gap-2 text-sm text-blue-500 mt-1">
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp habilitado
                    </div>
                  )}
                  {client.notes && (
                    <p className="text-sm text-muted-foreground mt-2">{client.notes}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedClientId(client.id)}
                  className="flex-1 gap-1"
                >
                  <ChevronRight className="w-4 h-4" />
                  Histórico
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenDialog(client)}
                  className="gap-1"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteClient(client.id)}
                  className="gap-1 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Client Details Dialog */}
      <Dialog open={selectedClientId !== null} onOpenChange={(open) => {
        if (!open) setSelectedClientId(null);
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {clients.find((c) => c.id === selectedClientId)?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Client Info */}
            {selectedClientId && (
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Telefone</p>
                <p className="font-semibold text-foreground">
                  {clients.find((c) => c.id === selectedClientId)?.phone || "Sem telefone cadastrado"}
                </p>
              </div>
            )}

            {/* Sales History */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Histórico de Vendas</h3>
              {historyLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              ) : salesHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma venda registrada</p>
              ) : (
                <div className="space-y-2">
                  {salesHistory.map((sale) => (
                    <div key={sale.id} className="flex justify-between items-center p-2 bg-muted rounded">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {formatDate(sale.date)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {sale.paymentType === "cash" ? "À Vista" : `${sale.installmentCount}x Parcelado`}
                        </p>
                      </div>
                      <p className="font-semibold text-foreground">
                        {formatCurrency(sale.total)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New/Edit Client Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar Cliente" : "Novo Cliente"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Nome *</label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Digite o nome do cliente"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Telefone {formData.whatsappEnabled && "*"}</label>
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="(00) 00000-0000"
                className="mt-1"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg border border-border">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-foreground">Habilitar WhatsApp</p>
                  <p className="text-xs text-muted-foreground">Enviar notificações de cobrança</p>
                </div>
              </div>
              <Switch
                checked={formData.whatsappEnabled}
                onCheckedChange={(checked) => {
                  setFormData((prev) => ({ ...prev, whatsappEnabled: checked }));
                }}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Observações</label>
              <Textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Adicione observações sobre o cliente"
                className="mt-1"
              />
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button
                variant="outline"
                onClick={resetForm}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveClient}
                disabled={createClientMutation.isPending || updateClientMutation.isPending}
              >
                {(createClientMutation.isPending || updateClientMutation.isPending) && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {isEditMode ? "Atualizar" : "Criar"} Cliente
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
