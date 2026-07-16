"use client";

import { useRef, useState } from "react";
import { buildWhatsappLink, shadeColor, toEmbedUrl } from "@/lib/landing";
import type { LandingSettings } from "@/lib/types";
import { useVideoProgress } from "./useVideoProgress";

export default function LandingForm({ settings }: { settings: LandingSettings }) {
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [cidade, setCidade] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const embedUrl = toEmbedUrl(settings.video_url || "");
  const bgFrom = settings.bg_color || "#0A121C";
  const bgTo = shadeColor(bgFrom, -18);
  const isColorVideo = settings.bg_media_type === "color_video";
  const pageBackground = isColorVideo ? bgFrom : `radial-gradient(circle at 30% 20%, ${bgTo} 0%, ${bgFrom} 60%)`;
  const textOnForm = settings.video_orientation === "vertical";
  const progress = useVideoProgress(iframeRef, embedUrl);
  const buttonsRevealed = progress >= (settings.button_reveal_percent || 0);
  const showLinkButton = buttonsRevealed && settings.show_web_link_button && !!settings.web_link_url;
  const showWhatsappButton = buttonsRevealed && settings.show_whatsapp_button && !!settings.whatsapp_number;

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
    <div className="landing-page" style={{ background: pageBackground }}>
      {settings.bg_media_type === "image" && settings.bg_media_url && (
        // eslint-disable-next-line @next/next/no-img-element -- arbitrary admin-supplied URL, not an optimizable local asset
        <img
          src={settings.bg_media_url}
          alt=""
          className="landing-bg-media"
          style={{ opacity: settings.bg_media_opacity / 100 }}
        />
      )}
      {settings.bg_media_type === "video" && settings.bg_media_url && (
        <video
          src={settings.bg_media_url}
          className="landing-bg-media"
          style={{ opacity: settings.bg_media_opacity / 100 }}
          autoPlay
          loop
          muted
          playsInline
        />
      )}
      {isColorVideo && settings.bg_media_url && (
        <>
          <video src={settings.bg_media_url} className="landing-bg-media" autoPlay loop muted playsInline />
          <div
            className="landing-bg-color-overlay"
            style={{ background: bgFrom, opacity: settings.bg_media_opacity / 100 }}
          />
        </>
      )}
      <div className={`landing-shell ${textOnForm ? "landing-shell--text-on-form" : "landing-shell--text-on-video"}`}>
        <div className="landing-hero-text">
          <div className="landing-eyebrow">{settings.hero_eyebrow || "Toque Aí · Seja um parceiro"}</div>
          <h1 className="landing-headline">
            {settings.hero_headline || "Transforme sua loja em ponto de venda Toque Aí"}
          </h1>
          <p className="landing-sub">
            {settings.hero_sub ||
              "Assista ao vídeo e conheça o modelo de parceria — comissão recorrente, suporte completo e produto pronto para vender."}
          </p>
        </div>

        <div className="landing-video-col">
          <div className="landing-video-wrap">
            {embedUrl ? (
              <iframe
                ref={iframeRef}
                src={embedUrl}
                title="Vídeo de apresentação"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            ) : (
              <div className="landing-video-placeholder">Vídeo em breve</div>
            )}
            {(showLinkButton || showWhatsappButton) && (
              <div className="landing-video-overlay visible">
                {showLinkButton && (
                  <a
                    className="overlay-link"
                    href={settings.web_link_url!}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {settings.web_link_label || "Saiba mais"} ↗
                  </a>
                )}
                {showWhatsappButton && (
                  <a
                    className="overlay-whatsapp"
                    href={buildWhatsappLink(
                      settings.whatsapp_number!,
                      "Olá! Assisti ao vídeo e quero saber mais sobre ser parceiro Scal.",
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Falar no WhatsApp
                  </a>
                )}
              </div>
            )}
          </div>
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
