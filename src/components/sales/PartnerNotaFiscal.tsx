"use client";

import { useState } from "react";
import { fmt } from "@/lib/format";
import type { Installment } from "@/lib/types";

export default function PartnerNotaFiscal({
  installment,
  onUploaded,
  onError,
}: {
  installment: Installment;
  onUploaded: () => void;
  onError: (message: string) => void;
}) {
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/installments/${installment.id}/nota-fiscal`, { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        onError(data.error || "Não foi possível enviar a nota fiscal.");
        return;
      }
      onUploaded();
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  if (!installment.nota_fiscal_url) {
    return (
      <div className="notification-card" style={{ marginTop: 10 }}>
        <div>
          <div className="name">
            <span className="notification-icon">📄</span>Nota fiscal pendente
          </div>
          <div className="meta">
            Você tem {fmt(installment.amount)} a receber este mês. Envie a nota fiscal para liberar o pagamento.
          </div>
        </div>
        <label className="receipt-upload">
          📄 {uploading ? "Enviando..." : "Enviar nota fiscal"}
          <input type="file" accept="image/*,.pdf" onChange={handleFile} disabled={uploading} />
        </label>
      </div>
    );
  }

  if (!installment.nota_fiscal_conferred) {
    return (
      <div className="notification-card" style={{ marginTop: 10 }}>
        <div>
          <div className="name">
            <span className="notification-icon">⏳</span>Nota fiscal enviada
          </div>
          <div className="meta">Aguardando conferência do distribuidor</div>
        </div>
        {installment.nota_fiscal_signed_url && (
          <a className="receipt-link" href={installment.nota_fiscal_signed_url} target="_blank" rel="noreferrer">
            📄 Ver nota fiscal
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="notification-card" style={{ marginTop: 10, background: "var(--signal-soft)", borderColor: "var(--signal)" }}>
      <div>
        <div className="name">
          <span className="notification-icon">✓</span>Nota fiscal conferida
        </div>
        <div className="meta">O distribuidor já validou sua nota fiscal e vai efetuar o pagamento em breve.</div>
      </div>
      {installment.nota_fiscal_signed_url && (
        <a className="receipt-link" href={installment.nota_fiscal_signed_url} target="_blank" rel="noreferrer">
          📄 Ver nota fiscal
        </a>
      )}
    </div>
  );
}
