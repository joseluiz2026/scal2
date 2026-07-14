"use client";

import { useState } from "react";
import type { Partner } from "@/lib/types";

export default function EditCredentialsModal({
  partner,
  onSaveUsername,
  onRegeneratePassword,
  onClose,
}: {
  partner: Partner;
  onSaveUsername: (username: string) => Promise<boolean>;
  onRegeneratePassword: () => Promise<boolean>;
  onClose: () => void;
}) {
  const [username, setUsername] = useState(partner.username || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSaveUsername() {
    const trimmed = username.trim();
    if (!trimmed || trimmed === partner.username) return;
    setError("");
    setBusy(true);
    try {
      const ok = await onSaveUsername(trimmed);
      if (!ok) setError("Não foi possível salvar o novo usuário.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRegeneratePassword() {
    setError("");
    setBusy(true);
    try {
      const ok = await onRegeneratePassword();
      if (!ok) setError("Não foi possível gerar a senha.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="pix-modal-overlay">
      <div className="pix-modal-card">
        <div className="pix-modal-head">
          <div>
            <div className="pix-modal-title">Editar credenciais</div>
            <div className="pix-modal-sub">{partner.pessoa === "PF" ? partner.nome_completo : partner.fantasia}</div>
          </div>
          <button className="btn" onClick={onClose} disabled={busy}>
            Fechar
          </button>
        </div>

        <div className="field" style={{ marginTop: 4 }}>
          <label>Usuário</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="off" />
        </div>
        {error && <div className="login-error">{error}</div>}
        <div className="submit-row" style={{ justifyContent: "flex-start", gap: 8 }}>
          <button
            className="btn primary"
            onClick={handleSaveUsername}
            disabled={busy || !username.trim() || username.trim() === partner.username}
          >
            Salvar novo usuário
          </button>
          <button className="btn" onClick={handleRegeneratePassword} disabled={busy}>
            Gerar nova senha
          </button>
        </div>
      </div>
    </div>
  );
}
