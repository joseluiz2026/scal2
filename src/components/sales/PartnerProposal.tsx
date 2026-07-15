"use client";

import { useState } from "react";
import { fmtDateTime } from "@/lib/format";
import { generateProposalPdf } from "@/lib/pdfReport";
import type { Partner, Sale } from "@/lib/types";

export default function PartnerProposal({
  sale,
  partner,
  onUploaded,
  onError,
}: {
  sale: Sale;
  partner: Partner;
  onUploaded: () => void;
  onError: (message: string) => void;
}) {
  const [uploading, setUploading] = useState(false);

  function downloadProposal() {
    generateProposalPdf(partner, sale);
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/sales/${sale.id}/proposal`, { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        onError(data.error || "Não foi possível enviar a proposta assinada.");
        return;
      }
      onUploaded();
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  if (!sale.proposal_url) {
    return (
      <div className="notification-card" style={{ marginTop: 10 }}>
        <div>
          <div className="name">
            <span className="notification-icon">📄</span>Proposta comercial
          </div>
          <div className="meta">Baixe a proposta, imprima, colha a assinatura do cliente e envie a foto assinada.</div>
        </div>
        <div className="btn-row" style={{ flexWrap: "wrap" }}>
          <button className="btn" onClick={downloadProposal}>
            📄 Baixar proposta comercial
          </button>
          <label className="receipt-upload">
            {uploading ? "Enviando..." : "📤 Enviar proposta assinada"}
            <input type="file" accept="image/*,.pdf" onChange={handleFile} disabled={uploading} />
          </label>
        </div>
      </div>
    );
  }

  if (!sale.proposal_confirmed) {
    return (
      <div className="notification-card" style={{ marginTop: 10 }}>
        <div>
          <div className="name">
            <span className="notification-icon">⏳</span>Proposta assinada enviada
          </div>
          <div className="meta">Aguardando conferência do distribuidor.</div>
        </div>
        <div className="btn-row" style={{ flexWrap: "wrap" }}>
          {sale.proposal_signed_url && (
            <a className="receipt-link" href={sale.proposal_signed_url} target="_blank" rel="noreferrer">
              📄 Ver proposta assinada
            </a>
          )}
          <button className="btn" onClick={downloadProposal}>
            🖨️ Baixar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="notification-card" style={{ marginTop: 10, background: "var(--signal-soft)", borderColor: "var(--signal)" }}>
      <div>
        <div className="name">
          <span className="notification-icon">✓</span>Proposta confirmada
        </div>
        <div className="meta">
          Confirmada pelo distribuidor{sale.proposal_confirmed_at ? ` em ${fmtDateTime(sale.proposal_confirmed_at)}` : ""}.
        </div>
      </div>
      {sale.proposal_signed_url && (
        <a className="receipt-link" href={sale.proposal_signed_url} target="_blank" rel="noreferrer">
          📄 Ver proposta assinada
        </a>
      )}
    </div>
  );
}
