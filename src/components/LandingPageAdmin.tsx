"use client";

import { useEffect, useState } from "react";
import type { LandingLead, LandingSettings } from "@/lib/types";

const FALLBACK_SETTINGS: LandingSettings = {
  id: 1,
  bg_color: "#0A121C",
  video_url: "",
  web_link_url: "",
  web_link_label: "Saiba mais",
  whatsapp_number: "",
  show_web_link_button: true,
  show_whatsapp_button: true,
  button_reveal_percent: 0,
  updated_at: new Date(0).toISOString(),
};

export default function LandingPageAdmin({ onError }: { onError: (message: string) => void }) {
  const [settings, setSettings] = useState<LandingSettings | null>(null);
  const [leads, setLeads] = useState<LandingLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/landing/settings").then((res) => res.json().then((data) => ({ ok: res.ok, data }))),
      fetch("/api/landing/leads").then((res) => res.json().then((data) => ({ ok: res.ok, data }))),
    ])
      .then(([settingsRes, leadsRes]) => {
        if (!settingsRes.ok) {
          onError(settingsRes.data.error || "Não foi possível carregar as configurações.");
        }
        setSettings(settingsRes.ok ? settingsRes.data.settings : FALLBACK_SETTINGS);
        setLeads(leadsRes.ok ? leadsRes.data.leads || [] : []);
      })
      .catch(() => {
        onError("Não foi possível conectar. Tente novamente.");
        setSettings(FALLBACK_SETTINGS);
      })
      .finally(() => setLoading(false));
  }, [onError]);

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    try {
      const res = await fetch("/api/landing/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) {
        onError(data.error || "Não foi possível salvar as configurações.");
        return;
      }
      setSettings(data.settings);
    } catch {
      onError("Não foi possível conectar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  function update<K extends keyof LandingSettings>(key: K, value: LandingSettings[K]) {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  if (loading || !settings) {
    return (
      <div className="card">
        <div className="empty-state">Carregando...</div>
      </div>
    );
  }

  return (
    <>
      <div className="form-card" style={{ marginBottom: 24 }}>
        <div className="field-grid">
          <div className="field span2">
            <label>Cor de fundo</label>
            <input type="color" value={settings.bg_color} onChange={(e) => update("bg_color", e.target.value)} />
          </div>
          <div className="field">
            <label>WhatsApp de destino</label>
            <input
              value={settings.whatsapp_number || ""}
              onChange={(e) => update("whatsapp_number", e.target.value)}
              placeholder="5527900000000"
            />
          </div>
          <div className="field span2">
            <label>Vídeo (link do YouTube ou Vimeo)</label>
            <input
              value={settings.video_url || ""}
              onChange={(e) => update("video_url", e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>
          <div className="field">
            <label>Texto do botão de link</label>
            <input
              value={settings.web_link_label || ""}
              onChange={(e) => update("web_link_label", e.target.value)}
              placeholder="Saiba mais"
            />
          </div>
          <div className="field span3">
            <label>Link do botão (site externo)</label>
            <input
              value={settings.web_link_url || ""}
              onChange={(e) => update("web_link_url", e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="checkbox-group">
            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={settings.show_web_link_button}
                onChange={(e) => update("show_web_link_button", e.target.checked)}
              />
              <span>Mostrar botão de link</span>
            </label>
            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={settings.show_whatsapp_button}
                onChange={(e) => update("show_whatsapp_button", e.target.checked)}
              />
              <span>Mostrar botão de WhatsApp</span>
            </label>
          </div>
          <div className="field span3">
            <label>Exibir botão(ões) após {settings.button_reveal_percent}% do vídeo</label>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={settings.button_reveal_percent}
              onChange={(e) => update("button_reveal_percent", Number(e.target.value))}
            />
          </div>
        </div>
        <div className="submit-row">
          <a className="btn" href="/parceiros" target="_blank" rel="noopener noreferrer">
            👁️ Ver página
          </a>
          <button className="btn primary" onClick={handleSave} disabled={saving} style={{ marginLeft: 8 }}>
            {saving ? "Salvando..." : "Salvar configurações"}
          </button>
        </div>
      </div>

      <div className="section-head">
        <h2>Interessados captados</h2>
        <span className="count">{leads.length} cadastro{leads.length === 1 ? "" : "s"}</span>
      </div>
      <div className="card">
        {leads.length === 0 ? (
          <div className="empty-state">Nenhum interessado ainda.</div>
        ) : (
          leads.map((lead) => (
            <div className="row" key={lead.id}>
              <div className="row-info">
                <div className="name">{lead.nome}</div>
                <div className="meta">
                  {lead.whatsapp}
                  {lead.cidade ? ` · ${lead.cidade}` : ""}
                </div>
              </div>
              <div className="row-value">
                <div className="amount-label mono">{new Date(lead.created_at).toLocaleDateString("pt-BR")}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
