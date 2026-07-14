"use client";

import { useState } from "react";

export default function DeletePartnerModal({
  partnerName,
  activeSalesCount,
  onConfirm,
  onClose,
}: {
  partnerName: string;
  activeSalesCount: number;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}) {
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const matches = typed.trim() === partnerName.trim();

  async function handleConfirm() {
    if (!matches || busy) return;
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="pix-modal-overlay">
      <div className="pix-modal-card">
        <div className="pix-modal-head">
          <div>
            <div className="pix-modal-title">Excluir parceiro</div>
            <div className="pix-modal-sub">Essa ação não pode ser desfeita</div>
          </div>
          <button className="btn" onClick={onClose} disabled={busy}>
            Fechar
          </button>
        </div>
        <div className="login-error" style={{ marginTop: 0 }}>
          Isso vai apagar permanentemente <strong>{partnerName}</strong>, o login dele
          {activeSalesCount > 0 ? (
            <>
              {" "}
              e <strong>{activeSalesCount}</strong> venda{activeSalesCount > 1 ? "s" : ""} ativa
              {activeSalesCount > 1 ? "s" : ""} (com todo o histórico de comissões).
            </>
          ) : (
            "."
          )}
        </div>
        <div className="field" style={{ marginTop: 16 }}>
          <label>Digite &quot;{partnerName}&quot; para confirmar</label>
          <input type="text" value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" />
        </div>
        <div className="submit-row">
          <button className="btn ghost-red" onClick={handleConfirm} disabled={!matches || busy}>
            {busy ? "Excluindo..." : "Excluir permanentemente"}
          </button>
        </div>
      </div>
    </div>
  );
}
