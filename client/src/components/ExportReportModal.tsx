import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { FileDown } from "lucide-react";

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (filters: ExportFilters) => void;
  type: "sales" | "payments";
  clients?: Array<{ id: number; name: string }>;
  isLoading?: boolean;
}

export interface ExportFilters {
  startDate?: string;
  endDate?: string;
  clientId?: number;
  format: "pdf";
}

export function ExportReportModal({
  isOpen,
  onClose,
  onExport,
  type,
  clients = [],
  isLoading = false,
}: ExportReportModalProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [clientId, setClientId] = useState<string>("");

  const handleExport = () => {
    onExport({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      clientId: clientId ? parseInt(clientId) : undefined,
      format: "pdf",
    });
    handleClose();
  };

  const handleClose = () => {
    setStartDate("");
    setEndDate("");
    setClientId("");
    onClose();
  };

  const title = type === "sales" ? "Exportar Relatório de Vendas" : "Exportar Relatório de Pagamentos";
  const description =
    type === "sales"
      ? "Configure os filtros para gerar o relatório de vendas em PDF"
      : "Configure os filtros para gerar o relatório de pagamentos em PDF";

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Start Date */}
          <div className="space-y-2">
            <Label htmlFor="startDate">Data Inicial (Opcional)</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <Label htmlFor="endDate">Data Final (Opcional)</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Client Filter */}
          {clients.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="client">Cliente (Opcional)</Label>
              <select
                id="client"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
              >
                <option value="">Todos os clientes</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id.toString()}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleExport} disabled={isLoading} className="gap-2">
            <FileDown className="w-4 h-4" />
            {isLoading ? "Gerando..." : "Exportar PDF"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
