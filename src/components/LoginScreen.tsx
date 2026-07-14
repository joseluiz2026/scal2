"use client";

import Image from "next/image";
import { useState } from "react";

export default function LoginScreen({
  onLogin,
}: {
  onLogin: (session: { role: "admin" | "partner"; username: string }) => void;
}) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      </div>
    </div>
  );
}
