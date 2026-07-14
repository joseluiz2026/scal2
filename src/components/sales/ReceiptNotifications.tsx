"use client";

import { displayName } from "@/lib/commission";
import { fmt } from "@/lib/format";
import type { Installment, Sale } from "@/lib/types";

export default function ReceiptNotifications({
  sales,
  onConfirmed,
  onError,
}: {
  sales: Sale[];
  onConfirmed: () => void;
  onError: (message: string) => void;
}) {
  const pending: { sale: Sale; installment: Installment }[] = [];
  sales.forEach((s) => {
    (s.installments || []).forEach((i) => {
      if (i.receipt_url && !i.receipt_confirmed) pending.push({ sale: s, installment: i });
    });
  });

  if (pending.length === 0) return null;

  async function confirm(installmentId: string) {
    const res = await fetch(`/api/installments/${installmentId}/receipt/confirm`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      onError(data.error || "Não foi possível confirmar o recebimento.");
      return;
    }
    onConfirmed();
  }

  return (
    <>
      {pending.map(({ sale, installment }) => (
        <div className="notification-card" key={installment.id}>
          <div>
            <div className="name">
              <span className="notification-icon">🔔</span>Comprovante recebido · {displayName(sale.kind, sale.client_data)}
            </div>
            <div className="meta">
              Mês {installment.month} · {fmt(installment.amount)} · confira e confirme se o valor caiu na sua conta
            </div>
          </div>
          <div className="btn-row">
            {installment.receipt_signed_url && (
              <a className="receipt-link" href={installment.receipt_signed_url} target="_blank" rel="noreferrer">
                📎 Ver comprovante
              </a>
            )}
            <button className="btn primary" onClick={() => confirm(installment.id)}>
              Confirmar recebimento
            </button>
          </div>
        </div>
      ))}
    </>
  );
}
