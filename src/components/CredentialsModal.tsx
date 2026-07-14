"use client";

export default function CredentialsModal({
  data,
  onClose,
}: {
  data: { name: string; username: string; password: string };
  onClose: () => void;
}) {
  function copy() {
    navigator.clipboard.writeText(`Usuário: ${data.username}\nSenha: ${data.password}`);
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
        </div>
      </div>
    </div>
  );
}
