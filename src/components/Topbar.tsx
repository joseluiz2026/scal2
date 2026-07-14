"use client";

import Image from "next/image";

type Theme = "dark" | "light" | "grey";

export default function Topbar({
  theme,
  onThemeChange,
  onLogout,
  userLabel,
  showBell,
  unreadCount = 0,
}: {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  onLogout: () => void;
  userLabel?: string;
  showBell?: boolean;
  unreadCount?: number;
}) {
  return (
    <div className="topbar">
      <div className="brand">
        <div className="app-brand" title="Scal · plataforma">
          <Image src="/logo-toqueai.png" alt="Scal" width={64} height={64} />
        </div>
        <div className="brand-divider"></div>
        <div className="brand-text">
          <div className="title">Toque Aí · Espírito Santo</div>
          <div className="subtitle">Vivendas Projetos · Revendedor exclusivo ES</div>
        </div>
      </div>
      <div className="topbar-controls">
        {userLabel && (
          <div className="mono" style={{ fontSize: 12, color: "var(--text-muted)" }}>
            {userLabel}
          </div>
        )}
        <div className="theme-switch">
          <button
            className={theme === "light" ? "active" : ""}
            title="Modo claro"
            onClick={() => onThemeChange("light")}
          >
            ☀️
          </button>
          <button
            className={theme === "grey" ? "active" : ""}
            title="Modo cinza"
            onClick={() => onThemeChange("grey")}
          >
            ◐
          </button>
          <button
            className={theme === "dark" ? "active" : ""}
            title="Modo escuro"
            onClick={() => onThemeChange("dark")}
          >
            🌙
          </button>
        </div>
        {showBell && (
          <button
            className="bell-btn"
            title="Comunicados"
            onClick={() => document.getElementById("messages-section")?.scrollIntoView({ behavior: "smooth" })}
          >
            🔔{unreadCount > 0 && <span className="bell-badge">{unreadCount}</span>}
          </button>
        )}
        <button className="btn-logout" onClick={onLogout}>
          Sair
        </button>
      </div>
    </div>
  );
}
