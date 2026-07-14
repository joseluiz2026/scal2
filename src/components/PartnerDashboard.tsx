"use client";

import { useEffect, useState } from "react";
import { generatePartnerReportPdf } from "@/lib/pdfReport";
import { useToast } from "@/lib/useToast";
import type { Message, Partner, Sale } from "@/lib/types";
import PartnerStats from "./dashboard/PartnerStats";
import PartnerMessages from "./messages/PartnerMessages";
import QuoteForm from "./sales/QuoteForm";
import ReceiptNotifications from "./sales/ReceiptNotifications";
import SalesList from "./sales/SalesList";
import Toast from "./Toast";

export default function PartnerDashboard({ onUnreadChange }: { onUnreadChange?: (count: number) => void }) {
  const [partner, setPartner] = useState<Partner | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const { message, showToast } = useToast();

  useEffect(() => {
    fetch("/api/partners/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.partner) setPartner(data.partner);
      });
  }, []);

  useEffect(() => {
    fetch("/api/sales")
      .then((res) => res.json())
      .then((data) => {
        if (data.sales) setSales(data.sales);
      });
  }, []);

  function reloadSales() {
    fetch("/api/sales")
      .then((res) => res.json())
      .then((data) => {
        if (data.sales) setSales(data.sales);
      });
  }

  useEffect(() => {
    fetch("/api/messages")
      .then((res) => res.json())
      .then((data) => {
        if (data.messages) setMessages(data.messages);
      });
  }, []);

  useEffect(() => {
    if (!partner) return;
    const unread = messages.filter((m) => !(m.message_reads || []).some((r) => r.partner_id === partner.id)).length;
    onUnreadChange?.(unread);
  }, [messages, partner, onUnreadChange]);

  async function markRead(messageId: string) {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId ? { ...m, message_reads: [...(m.message_reads || []), { partner_id: partner!.id }] } : m,
      ),
    );
    await fetch(`/api/messages/${messageId}/read`, { method: "POST" });
  }

  function downloadReport() {
    if (!partner) return;
    const opened = generatePartnerReportPdf(partner, sales);
    showToast(
      opened
        ? "Relatório aberto em nova aba — use o botão de download do navegador ou Ctrl+P pra imprimir"
        : "Pop-up bloqueado pelo navegador — permita pop-ups para este site e tente de novo",
    );
  }

  return (
    <div className="wrap">
      <div className="section-head">
        <h2>Meu painel</h2>
      </div>
      {partner && <PartnerStats partner={partner} sales={sales} />}

      <div style={{ margin: "18px 0 20px 0" }}>
        <button className="btn primary" onClick={downloadReport}>
          📄 Baixar meu relatório (PDF)
        </button>
      </div>

      <ReceiptNotifications sales={sales} onConfirmed={reloadSales} onError={showToast} />

      {partner && <PartnerMessages messages={messages} partnerId={partner.id} onRead={markRead} />}

      <div className="section-head">
        <h2>Solicitar cotação</h2>
      </div>
      <QuoteForm
        onCreated={(sale) => {
          setSales((prev) => [sale, ...prev]);
          showToast("Pedido de cotação enviado ao distribuidor");
        }}
        onError={showToast}
      />

      <div className="section-head">
        <h2>Relatório de vendas</h2>
        <span className="count">{sales.length} no total</span>
      </div>
      {partner && <SalesList sales={sales} partnerRate={partner.rate} onChanged={reloadSales} onError={showToast} />}

      <Toast message={message} />
    </div>
  );
}
