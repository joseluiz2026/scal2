"use client";

import { useCallback, useEffect, useState } from "react";
import DistributorDashboard from "@/components/DistributorDashboard";
import LoginScreen from "@/components/LoginScreen";
import PartnerDashboard from "@/components/PartnerDashboard";
import Topbar from "@/components/Topbar";

type Theme = "dark" | "light" | "grey";
type Session = { role: "admin" | "partner"; username: string } | null;

export default function Home() {
  const [session, setSession] = useState<Session>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [theme, setTheme] = useState<Theme>("dark");
  const [unreadCount, setUnreadCount] = useState(0);
  const handleUnreadChange = useCallback((count: number) => setUnreadCount(count), []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setSession(data.user);
      })
      .finally(() => setCheckingSession(false));
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setSession(null);
  }

  if (checkingSession) {
    return null;
  }

  if (!session) {
    return <LoginScreen onLogin={setSession} />;
  }

  const userLabel =
    session.role === "admin" ? `Distribuidor · ${session.username}` : `Parceiro · ${session.username}`;

  return (
    <div id="app-shell">
      <Topbar
        theme={theme}
        onThemeChange={setTheme}
        onLogout={handleLogout}
        userLabel={userLabel}
        showBell={session.role === "partner"}
        unreadCount={unreadCount}
      />
      {session.role === "admin" ? (
        <DistributorDashboard theme={theme} />
      ) : (
        <PartnerDashboard onUnreadChange={handleUnreadChange} />
      )}
    </div>
  );
}
