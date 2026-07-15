import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { commissionRate, displayName, kindLabel } from "./commission";
import { fmt } from "./format";
import { proposalNumber, recurringServiceLabel } from "./proposal";
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

function addContinuationHeader(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages();
  for (let i = 2; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(20, 25, 35);
    doc.text("Toque AI", 14, 14);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(140);
    doc.text("Proposta Comercial · Continuação", 14, 19);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Página ${i} de ${pageCount}`, 196, 16, { align: "right" });
    doc.setDrawColor(26, 74, 37);
    doc.setLineWidth(0.5);
    doc.line(14, 22, 196, 22);
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

function clientField(client: Record<string, unknown>, key: string) {
  return String(client?.[key] ?? "").trim() || "-";
}

function clientProducts(client: Record<string, unknown>) {
  const items = [];
  if (client?.boxPortao) items.push("Toque Box Portão");
  if (client?.boxGaragem) items.push("Toque Box Garagem");
  return items.length ? items.join(" + ") : "-";
}

export function generateSupplierOrderPdf(partner: Partner, sales: Sale[]) {
  const activeSales = sales.filter((s) => s.status === "active");
  if (activeSales.length === 0) return { opened: false, blob: null as Blob | null, clientsCount: 0 };

  const doc = new jsPDF();
  const now = new Date();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(20, 25, 35);
  doc.text("Pedido de Instalação · Fornecedor Toque Aí", 14, 18);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(110);
  doc.text(`Parceiro: ${partnerName(partner)} · ${partner.segment}`, 14, 25);
  doc.text(
    `Gerado em ${now.toLocaleDateString("pt-BR")} às ${now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`,
    14,
    31,
  );

  let y = 41;

  const residencial = activeSales.filter((s) => s.kind === "residencial");
  const condominial = activeSales.filter((s) => s.kind === "condominial");

  if (residencial.length > 0) {
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Residências", 14, y);

    autoTable(doc, {
      startY: y + 4,
      head: [["Cliente", "CPF", "Endereço", "Telefones", "Produtos", "Data da venda", "Valor"]],
      body: residencial.map((s) => {
        const c = s.client_data;
        const cidade = clientField(c, "cidade");
        const endereco = `${clientField(c, "endereco")}${cidade !== "-" ? ` · ${cidade}` : ""}`;
        const tels = [clientField(c, "tel1"), clientField(c, "tel2"), clientField(c, "tel3")]
          .filter((t) => t !== "-")
          .join(" / ");
        return [
          clientField(c, "nomeCompleto"),
          clientField(c, "cpf"),
          endereco,
          tels || "-",
          clientProducts(c),
          new Date(s.sale_date).toLocaleDateString("pt-BR"),
          fmt((s.monthly_value || 0) + (s.installation_value || 0) + (s.setup_value || 0)),
        ];
      }),
      theme: "striped",
      headStyles: { fillColor: [20, 25, 35] },
      styles: { fontSize: 8 },
      margin: { left: 14, right: 14 },
    });

    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12;
  }

  if (condominial.length > 0) {
    if (y > 240) {
      doc.addPage();
      y = 20;
    }
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Condomínios", 14, y);

    autoTable(doc, {
      startY: y + 4,
      head: [["Condomínio", "Síndico/Responsável", "CNPJ", "Blocos", "Apartamentos", "Endereço", "Telefone", "Produtos", "Data da venda", "Valor"]],
      body: condominial.map((s) => {
        const c = s.client_data;
        const cidade = clientField(c, "cidade");
        const endereco = `${clientField(c, "endereco")}${cidade !== "-" ? ` · ${cidade}` : ""}`;
        return [
          clientField(c, "nomeCondominio"),
          clientField(c, "responsavel"),
          clientField(c, "cnpj"),
          clientField(c, "blocos"),
          clientField(c, "aptos"),
          endereco,
          clientField(c, "tel"),
          clientProducts(c),
          new Date(s.sale_date).toLocaleDateString("pt-BR"),
          fmt((s.monthly_value || 0) + (s.installation_value || 0) + (s.setup_value || 0)),
        ];
      }),
      theme: "striped",
      headStyles: { fillColor: [20, 25, 35] },
      styles: { fontSize: 8 },
      margin: { left: 14, right: 14 },
    });
  }

  addFooter(doc);

  const blob = doc.output("blob");
  const blobUrl = URL.createObjectURL(blob);
  const opened = !!window.open(blobUrl, "_blank");
  return { opened, blob, clientsCount: activeSales.length };
}

export function generateProposalPdf(partner: Partner, sale: Sale) {
  const doc = new jsPDF();
  const now = new Date();
  const client = sale.client_data;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(20, 25, 35);
  doc.text("Toque AI", 14, 18);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(140);
  doc.text("Tecnologia que conecta, protege e aproxima", 14, 23);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(20, 25, 35);
  doc.text("PROPOSTA COMERCIAL", 196, 16, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Nº ${proposalNumber(sale)}`, 196, 21, { align: "right" });
  doc.text(now.toLocaleDateString("pt-BR"), 196, 26, { align: "right" });

  doc.setDrawColor(26, 74, 37);
  doc.setLineWidth(0.7);
  doc.line(14, 28, 196, 28);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(26, 74, 37);
  doc.text(`Proposta de Serviços — Toque AI — ${displayName("condominial", client)}`, 105, 35, { align: "center" });

  let y = 43;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(95, 163, 68);
  doc.text("DADOS DO CONTRATANTE", 14, y);
  doc.setDrawColor(224, 224, 224);
  doc.line(14, y + 2, 196, y + 2);

  const razaoSocial = String(client?.razaoSocial ?? client?.nomeCondominio ?? "");
  const cnpj = String(client?.cnpj ?? "");
  const responsavel = String(client?.responsavel ?? "");
  const tel = String(client?.tel ?? "");
  const cidade = String(client?.cidade ?? "");
  const endereco = `${String(client?.endereco ?? "")}${cidade ? ` · ${cidade}` : ""}`;

  autoTable(doc, {
    startY: y + 5,
    body: [
      ["Razão Social", razaoSocial, "CNPJ/CPF", cnpj],
      ["Contato", responsavel, "Telefone", tel],
      ["Endereço", endereco, "", ""],
    ],
    theme: "plain",
    styles: { fontSize: 9, cellPadding: 1 },
    columnStyles: { 0: { textColor: 110, cellWidth: 28 }, 2: { textColor: 110, cellWidth: 24 } },
    margin: { left: 14, right: 14 },
  });

  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(26, 106, 48);
  doc.text("SERVIÇOS MENSAIS RECORRENTES", 14, y);

  const boxPortaoValue = sale.box_portao_value || 0;
  const boxGaragemValue = sale.box_garagem_value || 0;
  const serviceRows: string[][] = [[recurringServiceLabel(client), "MENSAL", `${fmt(sale.monthly_value || 0)}/mês`]];
  if (client?.boxPortao) serviceRows.push(["📦 Toque Box Portão", "MENSAL", `${fmt(boxPortaoValue)}/mês`]);
  if (client?.boxGaragem) serviceRows.push(["📦 Toque Box Garagem", "MENSAL", `${fmt(boxGaragemValue)}/mês`]);
  const monthlyTotal = (sale.monthly_value || 0) + boxPortaoValue + boxGaragemValue;

  autoTable(doc, {
    startY: y + 3,
    head: [["SERVIÇO", "RECORRÊNCIA", "VALOR"]],
    body: serviceRows,
    foot: [["TOTAL MENSAL — SERVIÇOS", "", `${fmt(monthlyTotal)}/mês`]],
    theme: "striped",
    headStyles: { fillColor: [232, 245, 224], textColor: [45, 106, 48], fontSize: 8.5 },
    footStyles: { fillColor: [26, 74, 37], textColor: [158, 241, 119], fontSize: 9, fontStyle: "bold" },
    styles: { fontSize: 9, cellPadding: 1.5 },
    margin: { left: 14, right: 14 },
  });

  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;

  const setupValue = sale.setup_value || 0;
  const installationValue = sale.installation_value || 0;
  if (setupValue > 0 || installationValue > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(160, 112, 0);
    doc.text("SETUP — PAGAMENTO ÚNICO (NA ATIVAÇÃO)", 14, y);

    const setupRows: string[][] = [];
    if (setupValue > 0) setupRows.push(["Setup Interfonia", "ÚNICO", fmt(setupValue)]);
    if (installationValue > 0) setupRows.push(["Taxa de Instalação", "ÚNICO", fmt(installationValue)]);

    autoTable(doc, {
      startY: y + 3,
      head: [["DESCRIÇÃO", "TIPO", "VALOR"]],
      body: setupRows,
      foot: [["TOTAL SETUP", "", fmt(setupValue + installationValue)]],
      theme: "striped",
      headStyles: { fillColor: [255, 248, 224], textColor: [160, 112, 0], fontSize: 8.5 },
      footStyles: { fillColor: [160, 112, 0], textColor: [255, 232, 122], fontSize: 9, fontStyle: "bold" },
      styles: { fontSize: 9, cellPadding: 1.5 },
      margin: { left: 14, right: 14 },
    });

    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;
  }

  doc.setFillColor(14, 32, 16);
  doc.setDrawColor(26, 74, 37);
  const boxHeight = installationValue + setupValue > 0 ? 19 : 13;
  doc.roundedRect(14, y, 182, boxHeight, 2, 2, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(95, 163, 68);
  doc.text("RESUMO FINANCEIRO", 20, y + 5.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(204, 204, 204);
  doc.text("Total Mensal Recorrente", 20, y + 11.5);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11.5);
  doc.setTextColor(158, 241, 119);
  doc.text(`${fmt(monthlyTotal)}/mês`, 190, y + 11.5, { align: "right" });
  if (setupValue + installationValue > 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(224, 160, 32);
    doc.text("Setup — Pagamento Único (1ª fatura)", 20, y + 17);
    doc.setFont("helvetica", "bold");
    doc.text(fmt(setupValue + installationValue), 190, y + 17, { align: "right" });
  }

  y += boxHeight + 6;
  const obsHeight = 14;
  doc.setFillColor(255, 251, 240);
  doc.setDrawColor(224, 160, 32);
  doc.rect(14, y, 1.2, obsHeight, "F");
  doc.setFillColor(255, 251, 240);
  doc.rect(15.2, y, 180.8, obsHeight, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(85, 85, 85);
  doc.text("Observações:", 20, y + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  const obs =
    "Valores mensais via boleto ou PIX. Setup e taxa de instalação cobrados uma única vez na ativação. Contrato mínimo de 12 meses. Esta proposta é válida por 15 dias a partir da data de sua emissão.";
  doc.text(doc.splitTextToSize(obs, 172), 20, y + 10);

  y += obsHeight + 8;
  if (y > 240) {
    doc.addPage();
    y = 34;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(95, 163, 68);
  doc.text("TERMO DE ACEITE", 14, y);
  doc.setDrawColor(224, 224, 224);
  doc.line(14, y + 2, 196, y + 2);

  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);
  const termoLines = doc.splitTextToSize(
    "Ao assinar este documento, o(a) contratante declara estar de acordo com os serviços, valores e condições descritos nesta proposta comercial.",
    182,
  );
  doc.text(termoLines, 14, y);
  y += termoLines.length * 3.8 + 3;

  doc.setTextColor(160, 112, 0);
  const instalacaoLines = doc.splitTextToSize(
    "A instalação poderá ocorrer a qualquer momento, em até 15 (quinze) dias úteis, contados a partir da confirmação desta proposta pelo distribuidor.",
    182,
  );
  doc.text(instalacaoLines, 14, y);
  y += instalacaoLines.length * 3.8 + 10;

  doc.setDrawColor(150, 150, 150);
  doc.line(14, y, 95, y);
  doc.line(125, y, 196, y);
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text("Assinatura do contratante", 14, y + 5);
  doc.text("Data da assinatura", 125, y + 5);

  doc.setDrawColor(221, 221, 221);
  doc.line(14, 274, 196, 274);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(102, 102, 102);
  doc.text("toqueai.com.br · comercial@toqueai.com.br", 14, 280);
  doc.setTextColor(136, 136, 136);
  doc.text("Toqueai Serviços de Informação na Internet LTDA", 14, 285);
  doc.text("CNPJ: 59.969.655/0001-15 · Telefone/Whatsapp: (31) 2181-0061", 14, 290);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(26, 74, 37);
  doc.text("Proposta gerada por", 196, 280, { align: "right" });
  doc.setFontSize(10);
  doc.text(partnerName(partner), 196, 285, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setTextColor(85, 85, 85);
  doc.text(partner.telefone || "-", 196, 290, { align: "right" });

  addContinuationHeader(doc);

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
