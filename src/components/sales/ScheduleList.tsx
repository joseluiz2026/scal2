"use client";

import { commissionRate, displayName, kindLabel } from "@/lib/commission";
import { fmt } from "@/lib/format";
import type { Sale } from "@/lib/types";
import AdminNotaFiscal from "./AdminNotaFiscal";
import Dial from "./Dial";
import OneTimeLine from "./OneTimeLine";

export default function ScheduleList({
  sales,
  onChanged,
  onError,
}: {
  sales: Sale[];
  onChanged: () => void;
  onError: (message: string) => void;
}) {
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

  if (sales.length === 0) {
    return <div className="empty-state">Nenhuma venda ativa ainda.</div>;
  }

  return (
    <div className="card">
      {sales.map((s) => {
        const partner = s.partners;
        const paidCount = (s.installments || []).filter((i) => i.status === "paid").length;
        const isCancelled = s.status === "cancelled";
        const rate = commissionRate(s.kind, s.client_data, partner?.rate || 0);
        const dueInstallment = (s.installments || []).find((i) => i.status === "due");

        return (
          <div className="sale-block" key={s.id}>
            <div className="sale-top">
              <div className="row-info">
                <div className="name" style={isCancelled ? { color: "var(--red)" } : undefined}>
                  {displayName(s.kind, s.client_data)}
                </div>
                <div className="meta">
                  {fmt((s.monthly_value || 0) * rate)}/mês ({(rate * 100).toFixed(0)}%) · {paidCount}/12 pago
                </div>
              </div>
              <div className="btn-row">
                <span className="badge kind">{kindLabel(s.kind)}</span>
                <span className={`badge ${isCancelled ? "cancelled" : "active"}`}>{isCancelled ? "Cancelada" : "Ativa"}</span>
                {!isCancelled && (
                  <button className="btn ghost-red" onClick={() => cancelSale(s)}>
                    Avisar cancelamento
                  </button>
                )}
              </div>
            </div>
            <Dial installments={s.installments || []} onMarkPaid={isCancelled ? undefined : markPaid} />
            <OneTimeLine sale={s} editable={!isCancelled} onMarkPaid={() => markOneTimePaid(s.id)} />
            {!isCancelled && dueInstallment && (
              <div style={{ marginTop: 10 }}>
                <AdminNotaFiscal installment={dueInstallment} onChanged={onChanged} onError={onError} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
