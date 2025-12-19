import jsPDF from "jspdf";
import "jspdf-autotable";

interface Sale {
  id: number;
  clientName: string;
  date: Date | string;
  total: number;
  paymentType: "cash" | "installment";
  installmentCount: number;
}

interface Product {
  id: number;
  description: string;
  price: number;
  quantity: number;
}

interface Installment {
  id: number;
  number: number;
  dueDate: Date | string;
  amount: number;
  status: "pending" | "paid";
}

export function generateSalesPDF(
  sales: (Sale & { products?: Product[] })[],
  startDate?: Date,
  endDate?: Date,
  clientName?: string
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 15;

  // Header
  doc.setFontSize(20);
  doc.text("Relatório de Vendas", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 10;

  // Filter info
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  let filterText = `Gerado em: ${new Date().toLocaleDateString("pt-BR")}`;
  if (startDate || endDate) {
    filterText += ` | Período: ${startDate ? new Date(startDate).toLocaleDateString("pt-BR") : "Início"} a ${endDate ? new Date(endDate).toLocaleDateString("pt-BR") : "Fim"}`;
  }
  if (clientName) {
    filterText += ` | Cliente: ${clientName}`;
  }
  doc.text(filterText, 10, yPosition);
  yPosition += 8;

  // Summary
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalSales = sales.length;
  const cashSales = sales.filter(s => s.paymentType === "cash").length;
  const installmentSales = sales.filter(s => s.paymentType === "installment").length;

  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(`Total de Vendas: ${totalSales}`, 10, yPosition);
  yPosition += 6;
  doc.text(`Receita Total: R$ ${(totalRevenue / 100).toFixed(2).replace(".", ",")}`, 10, yPosition);
  yPosition += 6;
  doc.text(`À Vista: ${cashSales} | Parcelado: ${installmentSales}`, 10, yPosition);
  yPosition += 10;

  // Table
  const tableData = sales.map((sale) => [
    new Date(sale.date).toLocaleDateString("pt-BR"),
    sale.clientName,
    sale.paymentType === "cash" ? "À Vista" : `${sale.installmentCount}x`,
    `R$ ${(sale.total / 100).toFixed(2).replace(".", ",")}`,
  ]);

  (doc as any).autoTable({
    head: [["Data", "Cliente", "Pagamento", "Valor"]],
    body: tableData,
    startY: yPosition,
    margin: { top: 10, right: 10, bottom: 10, left: 10 },
    styles: {
      font: "helvetica",
      fontSize: 10,
      textColor: [0, 0, 0],
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  });

  // Footer
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text(
    `Página 1 de 1`,
    pageWidth / 2,
    pageHeight - 10,
    { align: "center" }
  );

  return doc;
}

export function generatePaymentsPDF(
  installments: Installment[],
  clientsMap: Record<number, string>,
  startDate?: Date,
  endDate?: Date,
  clientName?: string
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 15;

  // Header
  doc.setFontSize(20);
  doc.text("Relatório de Pagamentos", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 10;

  // Filter info
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  let filterText = `Gerado em: ${new Date().toLocaleDateString("pt-BR")}`;
  if (startDate || endDate) {
    filterText += ` | Período: ${startDate ? new Date(startDate).toLocaleDateString("pt-BR") : "Início"} a ${endDate ? new Date(endDate).toLocaleDateString("pt-BR") : "Fim"}`;
  }
  if (clientName) {
    filterText += ` | Cliente: ${clientName}`;
  }
  doc.text(filterText, 10, yPosition);
  yPosition += 8;

  // Summary
  const totalAmount = installments.reduce((sum, inst) => sum + inst.amount, 0);
  const paidAmount = installments
    .filter(i => i.status === "paid")
    .reduce((sum, inst) => sum + inst.amount, 0);
  const pendingAmount = installments
    .filter(i => i.status === "pending")
    .reduce((sum, inst) => sum + inst.amount, 0);
  const paidCount = installments.filter(i => i.status === "paid").length;
  const pendingCount = installments.filter(i => i.status === "pending").length;

  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(`Total de Parcelas: ${installments.length}`, 10, yPosition);
  yPosition += 6;
  doc.text(`Valor Total: R$ ${(totalAmount / 100).toFixed(2).replace(".", ",")}`, 10, yPosition);
  yPosition += 6;
  doc.text(
    `Pagos: ${paidCount} (R$ ${(paidAmount / 100).toFixed(2).replace(".", ",")}) | Pendentes: ${pendingCount} (R$ ${(pendingAmount / 100).toFixed(2).replace(".", ",")})`,
    10,
    yPosition
  );
  yPosition += 10;

  // Table
  const tableData = installments.map((inst) => [
    new Date(inst.dueDate).toLocaleDateString("pt-BR"),
    `Parcela ${inst.number}`,
    `R$ ${(inst.amount / 100).toFixed(2).replace(".", ",")}`,
    inst.status === "paid" ? "Pago" : "Pendente",
  ]);

  (doc as any).autoTable({
    head: [["Vencimento", "Parcela", "Valor", "Status"]],
    body: tableData,
    startY: yPosition,
    margin: { top: 10, right: 10, bottom: 10, left: 10 },
    styles: {
      font: "helvetica",
      fontSize: 10,
      textColor: [0, 0, 0],
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  });

  // Footer
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text(
    `Página 1 de 1`,
    pageWidth / 2,
    pageHeight - 10,
    { align: "center" }
  );

  return doc;
}

export function downloadPDF(doc: jsPDF, filename: string) {
  doc.save(filename);
}
