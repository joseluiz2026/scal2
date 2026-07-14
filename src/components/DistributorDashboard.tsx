"use client";

import { useEffect, useState } from "react";
import { generateMonthlyReportPdf } from "@/lib/pdfReport";
import type { Message, Partner, Sale } from "@/lib/types";
import { useToast } from "@/lib/useToast";
import CredentialsModal from "./CredentialsModal";
import DashboardCharts from "./dashboard/DashboardCharts";
import DistStats from "./dashboard/DistStats";
import KpiStack from "./dashboard/KpiStack";
import OverviewCard from "./dashboard/OverviewCard";
import RankingCard from "./dashboard/RankingCard";
import MessageForm from "./messages/MessageForm";
import SentMessagesList from "./messages/SentMessagesList";
import PartnerForm from "./PartnerForm";
import PartnersList from "./PartnersList";
import PendingQuotesList from "./sales/PendingQuotesList";
import ScheduleList from "./sales/ScheduleList";
import Toast from "./Toast";

export default function DistributorDashboard({ theme }: { theme: string }) {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [partnersLoading, setPartnersLoading] = useState(true);
  const [sales, setSales] = useState<Sale[]>([]);
  const [salesLoading, setSalesLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [credentials, setCredentials] = useState<{ name: string; username: string; password: string } | null>(null);
  const { message, showToast } = useToast();

  useEffect(() => {
    fetch("/api/partners")
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (ok) setPartners(data.partners);
      })
      .finally(() => setPartnersLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/sales")
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (ok) setSales(data.sales);
      })
      .finally(() => setSalesLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/messages")
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (ok) setMessages(data.messages);
      });
  }, []);

  function loadSales() {
    setSalesLoading(true);
    fetch("/api/sales")
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (ok) setSales(data.sales);
      })
      .finally(() => setSalesLoading(false));
  }

  const pendingSales = sales.filter((s) => s.status === "aguardando_cotacao");
  const scheduleSales = sales.filter((s) => s.status === "active" || s.status === "cancelled");

  function downloadMonthlyReport() {
    const opened = generateMonthlyReportPdf(partners, sales);
    showToast(
      opened
        ? "Relatório aberto em nova aba — use o botão de download do navegador ou Ctrl+P pra imprimir"
        : "Pop-up bloqueado pelo navegador — permita pop-ups para este site e tente de novo",
    );
  }

  return (
    <div className="wrap">
      <div className="section-head">
        <h2>Visão geral</h2>
        <button className="btn primary" onClick={downloadMonthlyReport}>
          📄 Gerar relatório do mês (PDF)
        </button>
      </div>
      <DistStats partners={partners} sales={sales} />

      {!salesLoading && !partnersLoading && <DashboardCharts partners={partners} sales={sales} theme={theme} />}

      <div className="section-head">
        <h2>Resumo do mês</h2>
      </div>
      <div className="summary-grid">
        <KpiStack sales={sales} />
        <OverviewCard sales={sales} />
        <RankingCard partners={partners} sales={sales} />
      </div>

      <div className="section-head">
        <h2>Pedidos de cotação</h2>
        <span className="count">{pendingSales.length} aguardando cotação</span>
      </div>
      {salesLoading ? (
        <div className="card">
          <div className="empty-state">Carregando...</div>
        </div>
      ) : (
        <PendingQuotesList sales={pendingSales} onChanged={loadSales} onError={showToast} />
      )}

      <div className="section-head">
        <h2>Cronograma de comissões</h2>
        <span className="count">clique num mês pendente para marcar como pago</span>
      </div>
      {!salesLoading && <ScheduleList sales={scheduleSales} onChanged={loadSales} onError={showToast} />}

      <div className="section-head">
        <h2>Cadastrar novo parceiro</h2>
      </div>
      <PartnerForm
        onCreated={(partner, creds) => {
          setPartners((prev) => [partner, ...prev]);
          setCredentials(creds);
          showToast("Parceiro cadastrado · confira as credenciais geradas");
        }}
        onError={showToast}
      />

      <div className="section-head">
        <h2>Parceiros cadastrados</h2>
      </div>
      <PartnersList partners={partners} loading={partnersLoading} />

      <div className="section-head">
        <h2>Comunicados</h2>
      </div>
      <MessageForm
        partners={partners}
        onSent={(msg, recipientLabel) => {
          setMessages((prev) => [msg, ...prev]);
          showToast(`Comunicado enviado para ${recipientLabel}`);
        }}
        onError={showToast}
      />
      <div style={{ marginTop: 14 }}>
        <SentMessagesList messages={messages} partners={partners} />
      </div>

      {credentials && <CredentialsModal data={credentials} onClose={() => setCredentials(null)} />}
      <Toast message={message} />
    </div>
  );
}
