"use client";

import { useState } from "react";
import { fmtDateTime } from "@/lib/format";
import { generateProposalPdf } from "@/lib/pdfReport";
import type { Partner, Sale } from "@/lib/types";

export default function AdminProposal({
  sale,
  partner,
  onChanged,
  onError,
  onConfirmed,
}: {
  sale: Sale;
  partner: Partner;
  onChanged: () => void;
  onError: (message: string) => void;
  onConfirmed?: () => void;
}) {
  const [busy, setBusy] = useState(false);

  function previewProposal() {
    generateProposalPdf(partner, sale);
  }

  async function confirm() {
    setBusy(true);
    try {
      const res = await fetch(`/api/sales/${sale.id}/proposal/confirm`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        onError(data.error || "Não foi possível confirmar a proposta.");
        return;
      }
      onChanged();
      onConfirmed?.();
    } finally {
      setBusy(false);
    }
  }

  if (!sale.proposal_url) {
    return (
      <div className="btn-row" style={{ marginTop: 8, flexWrap: "wrap" }}>
        <span className="receipt-empty">⏳ Aguardando o parceiro enviar a proposta assinada</span>
        <button className="btn" onClick={previewProposal}>
          🖨️ Ver proposta (PDF)
        </button>
      </div>
    );
  }

  if (!sale.proposal_confirmed) {
    return (
      <div className="btn-row" style={{ marginTop: 8, flexWrap: "wrap" }}>
        {sale.proposal_signed_url && (
          <a className="receipt-link" href={sale.proposal_signed_url} target="_blank" rel="noreferrer">
            📄 Ver proposta assinada
          </a>
        )}
        <button className="btn" onClick={previewProposal}>
          🖨️ Ver proposta (PDF)
        </button>
        <button className="btn primary" onClick={confirm} disabled={busy}>
          Confirmar proposta e gerar pedido
        </button>
      </div>
    );
  }

  return (
    <div className="btn-row" style={{ marginTop: 8, flexWrap: "wrap" }}>
      {sale.proposal_signed_url && (
        <a className="receipt-link" href={sale.proposal_signed_url} target="_blank" rel="noreferrer">
          📄 Ver proposta assinada
        </a>
      )}
      <span className="badge active">
        ✓ Proposta confirmada{sale.proposal_confirmed_at ? ` · ${fmtDateTime(sale.proposal_confirmed_at)}` : ""}
      </span>
    </div>
  );
}
