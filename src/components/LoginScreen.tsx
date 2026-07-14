"use client";

import Image from "next/image";
import { useState } from "react";
import CredentialsModal from "./CredentialsModal";

export default function LoginScreen({
  onLogin,
}: {
  onLogin: (session: { role: "admin" | "partner"; username: string }) => void;
}) {
  const [mode, setMode] = useState<"login" | "recover">("login");
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [recoverUser, setRecoverUser] = useState("");
  const [recoverDoc, setRecoverDoc] = useState("");
  const [recoverError, setRecoverError] = useState("");
  const [recoverLoading, setRecoverLoading] = useState(false);
  const [recoveredCreds, setRecoveredCreds] = useState<{ name: string; username: string; password: string } | null>(null);

  async function handleSubmit() {
    if (!user || !pass) {
      setError("Preencha usuário e senha.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user.trim(), password: pass }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Usuário ou senha inválidos.");
        return;
      }
      onLogin({ role: data.role, username: user.trim() });
    } catch {
      setError("Não foi possível conectar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRecover() {
    if (!recoverUser.trim() || !recoverDoc.trim()) {
      setRecoverError("Preencha usuário e CPF/CNPJ.");
      return;
    }
    setRecoverError("");
    setRecoverLoading(true);
    try {
      const res = await fetch("/api/auth/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: recoverUser.trim(), document: recoverDoc.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRecoverError(data.error || "Não foi possível recuperar a senha.");
        return;
      }
      setRecoveredCreds(data);
    } catch {
      setRecoverError("Não foi possível conectar. Tente novamente.");
    } finally {
      setRecoverLoading(false);
    }
  }

  function backToLogin() {
    setMode("login");
    setRecoverUser("");
    setRecoverDoc("");
    setRecoverError("");
  }

  return (
    <div id="view-login">
      <div className="login-card" style={{ maxWidth: 380, width: "100%" }}>
        <Image
          src="/logo-toqueai.png"
          alt="Scal"
          width={423}
          height={397}
          className="login-logo"
          priority
        />

        {mode === "login" ? (
          <>
            <div className="login-sub">Entre com seu usuário e senha</div>
            <div className="field" style={{ marginTop: 26 }}>
              <label>Usuário</label>
              <input
                type="text"
                placeholder="usuário"
                autoComplete="username"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubmit();
                }}
              />
            </div>
            <div className="field" style={{ marginTop: 14 }}>
              <label>Senha</label>
              <input
                type="password"
                placeholder="senha"
                autoComplete="current-password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubmit();
                }}
              />
            </div>
            {error && <div className="login-error">{error}</div>}
            <button
              className="btn primary"
              style={{ width: "100%", marginTop: 20 }}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
            <button
              className="btn"
              style={{ width: "100%", marginTop: 10, background: "transparent", border: "none" }}
              onClick={() => setMode("recover")}
            >
              Esqueci minha senha
            </button>
          </>
        ) : (
          <>
            <div className="login-sub">Informe seu usuário e CPF/CNPJ cadastrado para gerar uma senha nova</div>
            <div className="field" style={{ marginTop: 26 }}>
              <label>Usuário</label>
              <input
                type="text"
                placeholder="usuário"
                autoComplete="username"
                value={recoverUser}
                onChange={(e) => setRecoverUser(e.target.value)}
              />
            </div>
            <div className="field" style={{ marginTop: 14 }}>
              <label>CPF/CNPJ cadastrado</label>
              <input
                type="text"
                placeholder="000.000.000-00"
                value={recoverDoc}
                onChange={(e) => setRecoverDoc(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRecover();
                }}
              />
            </div>
            {recoverError && <div className="login-error">{recoverError}</div>}
            <button
              className="btn primary"
              style={{ width: "100%", marginTop: 20 }}
              onClick={handleRecover}
              disabled={recoverLoading}
            >
              {recoverLoading ? "Verificando..." : "Gerar senha nova"}
            </button>
            <button
              className="btn"
              style={{ width: "100%", marginTop: 10, background: "transparent", border: "none" }}
              onClick={backToLogin}
            >
              Voltar para o login
            </button>
          </>
        )}
      </div>

      {recoveredCreds && (
        <CredentialsModal
          data={recoveredCreds}
          onClose={() => {
            setRecoveredCreds(null);
            setUser(recoveredCreds.username);
            setPass("");
            backToLogin();
          }}
        />
      )}
    </div>
  );
}
