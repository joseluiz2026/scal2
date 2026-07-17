"use client";

import { buildWhatsappLink } from "@/lib/landing";

export default function CredentialsModal({
  data,
  whatsappNumber,
  onClose,
}: {
  data: { name: string; username: string; password: string };
  whatsappNumber?: string | null;
  onClose: () => void;
}) {
  function copy() {
    navigator.clipboard.writeText(`Usuário: ${data.username}\nSenha: ${data.password}`);
  }

  function sendWhatsapp() {
    if (!whatsappNumber) return;
    const loginUrl = window.location.origin;
    const message = `Olá ${data.name}! Você foi aprovado como parceiro oficial Toque Aí 🎉\n\nAcesse o app: ${loginUrl}\nUsuário: ${data.username}\nSenha: ${data.password}\n\nQualquer dúvida, é só chamar por aqui!`;
    window.open(buildWhatsappLink(whatsappNumber, message), "_blank");
  }

  return (
    <div className="pix-modal-overlay">
      <div className="pix-modal-card">
        <div className="pix-modal-head">
          <div>
            <div className="pix-modal-title">Credenciais do parceiro</div>
            <div className="pix-modal-sub">Envie estes dados para {data.name}</div>
          </div>
          <button className="btn" onClick={onClose}>
            Fechar
          </button>
        </div>
        <div className="credentials-box">
          <div className="cred-row">
            <span className="cred-label">Usuário</span>
            <span className="cred-value">{data.username}</span>
          </div>
          <div className="cred-row">
            <span className="cred-label">Senha</span>
            <span className="cred-value">{data.password}</span>
          </div>
        </div>
        <div className="submit-row">
          <button className="btn primary" onClick={copy}>
            Copiar credenciais
          </button>
          {whatsappNumber && (
            <button className="btn" onClick={sendWhatsapp} style={{ marginLeft: 8 }}>
              📲 Enviar por WhatsApp
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
