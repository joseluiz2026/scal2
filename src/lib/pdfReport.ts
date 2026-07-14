import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { commissionRate, displayName, kindLabel } from "./commission";
import { fmt } from "./format";
import type { Partner, Sale } from "./types";

function partnerName(p: Partner) {
  return p.pessoa === "PF" ? p.nome_completo || "" : p.fantasia || "";
}

function openGeneratedPdf(doc: jsPDF) {
  const blobUrl = URL.createObjectURL(doc.output("blob"));
  const opened = window.open(blobUrl, "_blank");
  return !!opened;
}

function addFooter(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(140);
    doc.text("Relatório gerado automaticamente pelo sistema SCAL · Toque AI Espírito Santo", 14, 290);
    doc.text(`Página ${i} de ${pageCount}`, 180, 290);
  }
}

function paidTotal(s: Sale) {
  const paidM = (s.installments || []).filter((i) => i.status === "paid").reduce((a, i) => a + i.amount, 0);
  const paidOT = s.one_time_status === "paid" ? 100 : 0;
  return paidM + paidOT;
}

export function generatePartnerReportPdf(partner: Partner, sales: Sale[]) {
  const doc = new jsPDF();
  const now = new Date();
  const monthLabel = now.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  const active = sales.filter((s) => s.status === "active");
  const cancelled = sales.filter((s) => s.status === "cancelled");

  const totalPaidAllTime = sales.reduce((sum, s) => sum + paidTotal(s), 0);
  const totalDueNow = active.reduce((sum, s) => {
    const due = (s.installments || []).find((i) => i.status === "due");
    const dueOT = s.one_time_status === "due" ? 100 : 0;
    return sum + (due ? due.amount : 0) + dueOT;
  }, 0);
  const totalFuture = active.reduce(
    (sum, s) => sum + (s.installments || []).filter((i) => i.status === "future").reduce((a, i) => a + i.amount, 0),
    0,
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(20, 25, 35);
  doc.text("Relatório do Parceiro · Toque AI Espírito Santo", 14, 18);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(110);
  doc.text(`${partnerName(partner)} · ${partner.segment}`, 14, 25);
  doc.text(
    `Período: ${monthLabel} · Gerado em ${now.toLocaleDateString("pt-BR")} às ${now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`,
    14,
    31,
  );

  let y = 41;
  doc.setTextColor(0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Resumo", 14, y);

  autoTable(doc, {
    startY: y + 4,
    head: [["Indicador", "Valor"]],
    body: [
      ["Clientes ativos", String(active.length)],
      ["Contratos cancelados", String(cancelled.length)],
      ["Total recebido desde o início", fmt(totalPaidAllTime)],
      ["A receber neste ciclo", fmt(totalDueNow)],
      ["Projeção restante (meses futuros)", fmt(totalFuture)],
      ["Chave Pix cadastrada", partner.pix || "-"],
    ],
    theme: "striped",
    headStyles: { fillColor: [20, 25, 35] },
    styles: { fontSize: 9 },
    margin: { left: 14, right: 14 },
  });

  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Meus contratos", 14, y);

  const contractRows = sales.map((s) => {
    const paidCount = (s.installments || []).filter((i) => i.status === "paid").length;
    const statusLabel = s.status === "active" ? "Ativo" : s.status === "cancelled" ? "Cancelado" : "Aguardando cotação";
    const rate = s.monthly_value ? commissionRate(s.kind, s.client_data, partner.rate) : 0;
    return [
      displayName(s.kind, s.client_data),
      kindLabel(s.kind),
      s.monthly_value ? `${fmt(s.monthly_value * rate)}/mês` : "—",
      `${paidCount}/12`,
      statusLabel,
    ];
  });

  autoTable(doc, {
    startY: y + 4,
    head: [["Cliente", "Tipo", "Comissão mensal", "Meses pagos", "Status"]],
    body: contractRows,
    theme: "striped",
    headStyles: { fillColor: [20, 25, 35] },
    styles: { fontSize: 9 },
    margin: { left: 14, right: 14 },
  });

  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12;
  if (y > 260) {
    doc.addPage();
    y = 20;
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text("Nota fiscal e comprovantes", 14, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(110);
  doc.text("Envio de nota fiscal e comprovantes ainda não disponível nesta versão do sistema.", 14, y + 7);

  addFooter(doc);
  return openGeneratedPdf(doc);
}

export function generateMonthlyReportPdf(partners: Partner[], sales: Sale[]) {
  const doc = new jsPDF();
  const now = new Date();
  const monthLabel = now.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  const activeSalesAll = sales.filter((s) => s.status === "active");
  const cancelledSalesAll = sales.filter((s) => s.status === "cancelled");
  const pendingQuotes = sales.filter((s) => s.status === "aguardando_cotacao");
  const activeResidencial = activeSalesAll.filter((s) => s.kind === "residencial").length;
  const activeCondominial = activeSalesAll.filter((s) => s.kind === "condominial").length;

  const totalPaidAllTime = sales.reduce((sum, s) => sum + paidTotal(s), 0);
  const totalDueNow = activeSalesAll.reduce((sum, s) => {
    const due = (s.installments || []).find((i) => i.status === "due");
    const dueOT = s.one_time_status === "due" ? 100 : 0;
    return sum + (due ? due.amount : 0) + dueOT;
  }, 0);
  const totalFutureProjection = activeSalesAll.reduce(
    (sum, s) => sum + (s.installments || []).filter((i) => i.status === "future").reduce((a, i) => a + i.amount, 0),
    0,
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(20, 25, 35);
  doc.text("Relatório Mensal · Toque AI Espírito Santo", 14, 18);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(110);
  doc.text(
    `Período: ${monthLabel} · Gerado em ${now.toLocaleDateString("pt-BR")} às ${now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`,
    14,
    25,
  );

  let y = 35;
  doc.setTextColor(0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Resumo executivo", 14, y);

  autoTable(doc, {
    startY: y + 4,
    head: [["Indicador", "Valor"]],
    body: [
      ["Parceiros cadastrados", String(partners.length)],
      ["Clientes ativos", `${activeSalesAll.length} (${activeResidencial} residencial · ${activeCondominial} condominial)`],
      ["Total pago desde o início (todos os parceiros)", fmt(totalPaidAllTime)],
      ["A pagar neste ciclo", fmt(totalDueNow)],
      ["Projeção restante (meses futuros dos contratos ativos)", fmt(totalFutureProjection)],
      ["Pedidos de cotação aguardando aprovação", String(pendingQuotes.length)],
      ["Contratos cancelados (histórico)", String(cancelledSalesAll.length)],
    ],
    theme: "striped",
    headStyles: { fillColor: [20, 25, 35] },
    styles: { fontSize: 9 },
    margin: { left: 14, right: 14 },
  });

  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Ranking de parceiros", 14, y);

  const partnersData = partners
    .map((p) => {
      const pContracts = sales.filter((s) => s.partner_id === p.id);
      const activeClients = pContracts.filter((s) => s.status === "active").length;
      const totalPaidPartner = pContracts.reduce((sum, s) => sum + paidTotal(s), 0);
      const dueNowPartner = pContracts
        .filter((s) => s.status === "active")
        .reduce((sum, s) => {
          const due = (s.installments || []).find((i) => i.status === "due");
          const dueOT = s.one_time_status === "due" ? 100 : 0;
          return sum + (due ? due.amount : 0) + dueOT;
        }, 0);
      return { name: partnerName(p), segment: p.segment, activeClients, totalPaidPartner, dueNowPartner };
    })
    .sort((a, b) => b.totalPaidPartner - a.totalPaidPartner);

  autoTable(doc, {
    startY: y + 4,
    head: [["Parceiro", "Segmento", "Clientes ativos", "A receber agora", "Total recebido (histórico)"]],
    body: partnersData.map((d) => [d.name, d.segment, String(d.activeClients), fmt(d.dueNowPartner), fmt(d.totalPaidPartner)]),
    theme: "striped",
    headStyles: { fillColor: [20, 25, 35] },
    styles: { fontSize: 9 },
    margin: { left: 14, right: 14 },
  });

  addFooter(doc);
  return openGeneratedPdf(doc);
}
