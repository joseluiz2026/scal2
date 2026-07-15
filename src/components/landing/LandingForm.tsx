"use client";

import { useState } from "react";
import { buildWhatsappLink, shadeColor, toEmbedUrl } from "@/lib/landing";
import type { LandingSettings } from "@/lib/types";

export default function LandingForm({ settings }: { settings: LandingSettings }) {
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [cidade, setCidade] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const embedUrl = toEmbedUrl(settings.video_url || "");
  const bgFrom = settings.bg_color || "#0A121C";
  const bgTo = shadeColor(bgFrom, -18);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!nome.trim() || !whatsapp.trim()) {
      setError("Preencha nome e WhatsApp.");
      return;
    }
    if (!settings.whatsapp_number) {
      setError("Cadastro indisponível no momento — tente novamente mais tarde.");
      return;
    }

    setSending(true);
    try {
      await fetch("/api/landing/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, whatsapp, cidade }),
      });
    } catch {
      // still proceed to WhatsApp even if the lead save fails silently
    } finally {
      setSending(false);
    }

    const message = `Olá! Quero ser parceiro Scal.\nNome: ${nome}\nWhatsApp: ${whatsapp}${cidade ? `\nCidade: ${cidade}` : ""}`;
    window.open(buildWhatsappLink(settings.whatsapp_number, message), "_blank");
  }

  return (
    <div
      className="landing-page"
      style={{ background: `radial-gradient(circle at 30% 20%, ${bgTo} 0%, ${bgFrom} 60%)` }}
    >
      <div className="landing-shell">
        <div className="landing-video-col">
          <div className="landing-eyebrow">Toque Aí · Seja um parceiro</div>
          <h1 className="landing-headline">Transforme sua loja em ponto de venda Toque Aí</h1>
          <p className="landing-sub">
            Assista ao vídeo e conheça o modelo de parceria — comissão recorrente, suporte completo e produto pronto
            para vender.
          </p>
          <div className="landing-video-wrap">
            {embedUrl ? (
              <iframe src={embedUrl} title="Vídeo de apresentação" allow="autoplay; encrypted-media" allowFullScreen />
            ) : (
              <div className="landing-video-placeholder">Vídeo em breve</div>
            )}
          </div>
          {settings.web_link_url && (
            <a className="landing-weblink" href={settings.web_link_url} target="_blank" rel="noopener noreferrer">
              {settings.web_link_label || "Saiba mais"} ↗
            </a>
          )}
        </div>

        <div className="landing-card">
          <h2>Quero ser parceiro</h2>
          <p className="landing-card-sub">Preencha seus dados — a conversa continua no WhatsApp.</p>
          <form onSubmit={handleSubmit}>
            <div className="landing-field">
              <label>Nome completo</label>
              <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" required />
            </div>
            <div className="landing-field">
              <label>WhatsApp</label>
              <input
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="(27) 90000-0000"
                required
              />
            </div>
            <div className="landing-field">
              <label>Cidade</label>
              <input value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Vitória - ES" />
            </div>
            <button className="landing-submit" type="submit" disabled={sending}>
              {sending ? "Enviando..." : "Quero assinar · falar no WhatsApp"}
            </button>
            {error && <div className="landing-feedback error">{error}</div>}
          </form>
        </div>
      </div>
    </div>
  );
}
