"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { commissionRate, displayName, kindLabel, ONE_TIME_COMMISSION } from "@/lib/commission";
import { fmt } from "@/lib/format";
import { buildPixPayload } from "@/lib/pix";
import type { Partner, Sale } from "@/lib/types";
import AdminNotaFiscal from "./AdminNotaFiscal";
import Dial from "./Dial";
import OneTimeLine from "./OneTimeLine";

export default function PartnerAccordion({
  partner,
  sales,
  onChanged,
  onError,
}: {
  partner: Partner;
  sales: Sale[];
  onChanged: () => void;
  onError: (message: string) => void;
}) {
  const [qrDataUrl, setQrDataUrl] = useState("");

  const activeSales = sales.filter((s) => s.status === "active");
  const dueTotal = activeSales.reduce((sum, s) => {
    const due = (s.installments || []).find((i) => i.status === "due");
    const oneTimeDue = s.one_time_status === "due" ? ONE_TIME_COMMISSION : 0;
    return sum + (due ? due.amount : 0) + oneTimeDue;
  }, 0);

  const partnerDisplayName = partner.pessoa === "PF" ? partner.nome_completo || "" : partner.fantasia || "";
  const payload = dueTotal > 0 && partner.pix ? buildPixPayload(partner.pix, dueTotal, partnerDisplayName) : "";

  useEffect(() => {
    if (!payload) return;
    let cancelled = false;
    QRCode.toDataURL(payload, { margin: 1, width: 160 }).then((url) => {
      if (!cancelled) setQrDataUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [payload]);

  async function markPaid(installmentId: string) {
    const res = await fetch(`/api/installments/${installmentId}/pay`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      onError(data.error || "Não foi possível marcar como pago.");
      return;
    }
    onChanged();
  }

  async function markOneTimePaid(saleId: string) {
    const res = await fetch(`/api/sales/${saleId}/one-time-pay`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      onError(data.error || "Não foi possível marcar a comissão como paga.");
      return;
    }
    onChanged();
  }

  async function cancelSale(sale: Sale) {
    if (
      !confirm(
        `Avisar que o cliente ${displayName(sale.kind, sale.client_data)} cancelou o contrato? O cronograma vai marcar exatamente onde parou, e as comissões futuras deixam de ser cobradas.`,
      )
    )
      return;
    const res = await fetch(`/api/sales/${sale.id}/cancel`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      onError(data.error || "Não foi possível cancelar a venda.");
      return;
    }
    onChanged();
  }

  function copyPayload() {
    navigator.clipboard.writeText(payload);
  }

  if (sales.length === 0) {
    return <div className="empty-state">Esse parceiro ainda não tem clientes cadastrados.</div>;
  }

  return (
    <div className="partner-group-contracts">
      {dueTotal > 0 && (
        <div className="partner-qr-panel">
          <div className="partner-qr-info">
            <div className="pix-info-line">
              Chave Pix: <span className="mono">{partner.pix}</span>
            </div>
            <div className="pix-info-line">
              Valor a receber este mês:{" "}
              <span className="mono" style={{ color: "var(--copper)", fontWeight: 700 }}>
                {fmt(dueTotal)}
              </span>
            </div>
          </div>
          <div className="pix-qr-box">
            {qrDataUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrDataUrl} alt="QR Code Pix" width={140} height={140} />
            )}
          </div>
          <div className="partner-qr-copy">
            <textarea readOnly rows={3} className="pix-payload-inline" value={payload} />
            <button className="btn" onClick={copyPayload}>
              Copiar código Pix
            </button>
          </div>
        </div>
      )}

      {sales.map((s) => {
        const isCancelled = s.status === "cancelled";
        const isPending = s.status === "aguardando_cotacao";
        const rate = commissionRate(s.kind, s.client_data, partner.rate);
        const paidCount = (s.installments || []).filter((i) => i.status === "paid").length;
        const dueInstallment = (s.installments || []).find((i) => i.status === "due");

        return (
          <div className="sale-block" key={s.id}>
            <div className="sale-top">
              <div className="row-info">
                <div className="name" style={isCancelled ? { color: "var(--red)" } : undefined}>
                  {displayName(s.kind, s.client_data)}
                </div>
                {!isPending && (
                  <div className="meta">
                    {fmt((s.monthly_value || 0) * rate)}/mês ({(rate * 100).toFixed(0)}%) · {paidCount}/12 pago
                  </div>
                )}
              </div>
              <div className="btn-row">
                <span className="badge kind">{kindLabel(s.kind)}</span>
                <span className={`badge ${isCancelled ? "cancelled" : isPending ? "pending" : "active"}`}>
                  {isCancelled ? "Cancelada" : isPending ? "Aguardando cotação" : "Ativa"}
                </span>
                {!isCancelled && !isPending && (
                  <button className="btn ghost-red" onClick={() => cancelSale(s)}>
                    Avisar cancelamento
                  </button>
                )}
              </div>
            </div>
            {!isPending && (
              <>
                <Dial installments={s.installments || []} onMarkPaid={isCancelled ? undefined : markPaid} />
                <OneTimeLine sale={s} editable={!isCancelled} onMarkPaid={() => markOneTimePaid(s.id)} />
                {!isCancelled && dueInstallment && (
                  <div style={{ marginTop: 10 }}>
                    <AdminNotaFiscal installment={dueInstallment} onChanged={onChanged} onError={onError} />
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
