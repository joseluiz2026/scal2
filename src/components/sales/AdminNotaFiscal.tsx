"use client";

import { useState } from "react";
import type { Installment } from "@/lib/types";

export default function AdminNotaFiscal({
  installment,
  onChanged,
  onError,
}: {
  installment: Installment;
  onChanged: () => void;
  onError: (message: string) => void;
}) {
  const [busy, setBusy] = useState(false);

  async function confer() {
    setBusy(true);
    try {
      const res = await fetch(`/api/installments/${installment.id}/nota-fiscal/confer`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        onError(data.error || "Não foi possível conferir a nota fiscal.");
        return;
      }
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  async function handleReceiptFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/installments/${installment.id}/receipt`, { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        onError(data.error || "Não foi possível anexar o comprovante.");
        return;
      }
      onChanged();
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  if (!installment.nota_fiscal_url) {
    return <span className="receipt-empty">⏳ Aguardando o parceiro enviar a nota fiscal para liberar o pagamento</span>;
  }

  if (!installment.nota_fiscal_conferred) {
    return (
      <div className="btn-row" style={{ marginTop: 8 }}>
        {installment.nota_fiscal_signed_url && (
          <a className="receipt-link" href={installment.nota_fiscal_signed_url} target="_blank" rel="noreferrer">
            📄 Ver nota fiscal
          </a>
        )}
        <button className="btn primary" onClick={confer} disabled={busy}>
          Conferir nota fiscal
        </button>
      </div>
    );
  }

  return (
    <div className="btn-row" style={{ marginTop: 8, flexWrap: "wrap" }}>
      {installment.nota_fiscal_signed_url && (
        <a className="receipt-link" href={installment.nota_fiscal_signed_url} target="_blank" rel="noreferrer">
          📄 Ver nota fiscal
        </a>
      )}
      <span className="badge active">✓ Nota fiscal conferida</span>
      {installment.receipt_url ? (
        <>
          {installment.receipt_signed_url && (
            <a className="receipt-link" href={installment.receipt_signed_url} target="_blank" rel="noreferrer">
              📎 Ver comprovante
            </a>
          )}
          <span className={`badge ${installment.receipt_confirmed ? "active" : "pending"}`}>
            {installment.receipt_confirmed ? "✓ Confirmado pelo parceiro" : "Aguardando confirmação"}
          </span>
        </>
      ) : (
        <label className="receipt-upload">
          📎 Anexar comprovante do pagamento
          <input type="file" accept="image/*,.pdf" onChange={handleReceiptFile} disabled={busy} />
        </label>
      )}
    </div>
  );
}
