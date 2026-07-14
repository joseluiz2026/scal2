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
  const [showDemo, setShowDemo] = useState(true);
  const { message, showToast } = useToast();

  useEffect(() => {
    const stored = localStorage.getItem("scal-show-demo");
    // localStorage is client-only and unavailable during the server render pass.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored !== null) setShowDemo(stored === "true");
  }, []);

  function toggleShowDemo() {
    setShowDemo((prev) => {
      const next = !prev;
      localStorage.setItem("scal-show-demo", String(next));
      return next;
    });
  }

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

  function toggleDemo(partner: Partner) {
    const nextIsDemo = !partner.is_demo;
    fetch(`/api/partners/${partner.id}/demo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_demo: nextIsDemo }),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) {
          showToast(data.error || "Não foi possível atualizar o parceiro.");
          return;
        }
        setPartners((prev) => prev.map((p) => (p.id === partner.id ? { ...p, is_demo: nextIsDemo } : p)));
        setSales((prev) =>
          prev.map((s) =>
            s.partner_id === partner.id && s.partners ? { ...s, partners: { ...s.partners, is_demo: nextIsDemo } } : s,
          ),
        );
      })
      .catch(() => showToast("Não foi possível conectar. Tente novamente."));
  }

  function deletePartner(partner: Partner) {
    return fetch(`/api/partners/${partner.id}`, { method: "DELETE" })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) {
          showToast(data.error || "Não foi possível excluir o parceiro.");
          return;
        }
        setPartners((prev) => prev.filter((p) => p.id !== partner.id));
        setSales((prev) => prev.filter((s) => s.partner_id !== partner.id));
        showToast("Parceiro excluído.");
      })
      .catch(() => showToast("Não foi possível conectar. Tente novamente."));
  }

  function loadSales() {
    setSalesLoading(true);
    fetch("/api/sales")
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (ok) setSales(data.sales);
      })
      .finally(() => setSalesLoading(false));
  }

  const visiblePartners = showDemo ? partners : partners.filter((p) => !p.is_demo);
  const visibleSales = showDemo ? sales : sales.filter((s) => !s.partners?.is_demo);
  const demoPartnerCount = partners.filter((p) => p.is_demo).length;

  const pendingSales = visibleSales.filter((s) => s.status === "aguardando_cotacao");
  const scheduleSales = visibleSales.filter((s) => s.status === "active" || s.status === "cancelled");

  function downloadMonthlyReport() {
    const opened = generateMonthlyReportPdf(visiblePartners, visibleSales);
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
        <div className="btn-row">
          {demoPartnerCount > 0 && (
            <button className="btn" onClick={toggleShowDemo}>
              {showDemo ? "🙈 Ocultar dados de demonstração" : "🎭 Mostrar dados de demonstração"}
            </button>
          )}
          <button className="btn primary" onClick={downloadMonthlyReport}>
            📄 Gerar relatório do mês (PDF)
          </button>
        </div>
      </div>
      <DistStats partners={visiblePartners} sales={visibleSales} />

      {!salesLoading && !partnersLoading && <DashboardCharts partners={visiblePartners} sales={visibleSales} theme={theme} />}

      <div className="section-head">
        <h2>Resumo do mês</h2>
      </div>
      <div className="summary-grid">
        <KpiStack sales={visibleSales} />
        <OverviewCard sales={visibleSales} />
        <RankingCard partners={visiblePartners} sales={visibleSales} />
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
      <PartnersList
        partners={visiblePartners}
        sales={visibleSales}
        loading={partnersLoading}
        onToggleDemo={toggleDemo}
        onDeletePartner={deletePartner}
        onChanged={loadSales}
        onError={showToast}
      />

      <div className="section-head">
        <h2>Comunicados</h2>
      </div>
      <MessageForm
        partners={visiblePartners}
        onSent={(msg, recipientLabel) => {
          setMessages((prev) => [msg, ...prev]);
          showToast(`Comunicado enviado para ${recipientLabel}`);
        }}
        onError={showToast}
      />
      <div style={{ marginTop: 14 }}>
        <SentMessagesList messages={messages} partners={visiblePartners} />
      </div>

      {credentials && <CredentialsModal data={credentials} onClose={() => setCredentials(null)} />}
      <Toast message={message} />
    </div>
  );
}
