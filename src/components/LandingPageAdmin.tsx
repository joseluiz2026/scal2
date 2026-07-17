"use client";

import { useEffect, useState } from "react";
import type { LandingLead, LandingSettings, Partner } from "@/lib/types";
import CredentialsModal from "./CredentialsModal";
import PartnerForm from "./PartnerForm";

const MAX_BG_VIDEO_BYTES = 50 * 1024 * 1024; // matches the storage bucket's fileSizeLimit
const ALLOWED_BG_VIDEO_TYPES = ["video/mp4", "video/webm"];

// Uploads straight to the Supabase-issued signed URL via XHR (not fetch) because only
// XHR exposes upload progress events — with fetch the UI has no way to tell a slow
// transfer apart from a stuck one.
function uploadWithProgress(signedUrl: string, file: File, onProgress: (percent: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", signedUrl);
    xhr.setRequestHeader("apikey", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "");
    xhr.setRequestHeader("authorization", `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""}`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload falhou (status ${xhr.status}): ${xhr.responseText.slice(0, 200)}`));
    };
    xhr.onerror = () => reject(new Error("Falha de rede durante o envio."));
    xhr.onabort = () => reject(new Error("Envio cancelado."));

    const body = new FormData();
    body.append("cacheControl", "3600");
    body.append("", file);
    xhr.send(body);
  });
}

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
  bg_media_type: "none",
  bg_media_url: "",
  bg_media_opacity: 100,
  hero_eyebrow: "Toque Aí · Seja um parceiro",
  hero_headline: "Transforme sua loja em ponto de venda Toque Aí",
  hero_sub:
    "Assista ao vídeo e conheça o modelo de parceria — comissão recorrente, suporte completo e produto pronto para vender.",
  hero_headline_size: 34,
  hero_headline_color: "#EEF2F7",
  hero_sub_size: 15,
  hero_sub_color: "#C9D3DE",
  hero_text_align: "left",
  hero_headline_width_percent: 100,
  hero_sub_width_percent: 100,
  video_width_percent: 70,
  form_width_percent: 50,
  form_enabled: true,
  updated_at: new Date(0).toISOString(),
};

export default function LandingPageAdmin({ onError }: { onError: (message: string) => void }) {
  const [settings, setSettings] = useState<LandingSettings | null>(null);
  const [leads, setLeads] = useState<LandingLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingBgVideo, setUploadingBgVideo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingBgImage, setUploadingBgImage] = useState(false);
  const [bgImageUploadProgress, setBgImageUploadProgress] = useState(0);
  const [convertingLead, setConvertingLead] = useState<LandingLead | null>(null);
  const [credentials, setCredentials] = useState<{ name: string; username: string; password: string; whatsappNumber: string } | null>(
    null,
  );

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

  async function handleBgVideoUpload(file: File) {
    if (!ALLOWED_BG_VIDEO_TYPES.includes(file.type)) {
      onError("Envie um arquivo de vídeo .mp4 ou .webm.");
      return;
    }
    if (file.size > MAX_BG_VIDEO_BYTES) {
      onError("O vídeo excede o limite de 50MB.");
      return;
    }

    setUploadingBgVideo(true);
    setUploadProgress(0);
    try {
      const prepRes = await fetch("/api/landing/bg-media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType: file.type }),
      });
      const prepData = await prepRes.json();
      if (!prepRes.ok) {
        onError(prepData.error || "Não foi possível preparar o envio do vídeo.");
        return;
      }

      await uploadWithProgress(prepData.signedUrl, file, setUploadProgress);
      update("bg_media_url", prepData.publicUrl);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Não foi possível enviar o vídeo.");
    } finally {
      setUploadingBgVideo(false);
      setUploadProgress(0);
    }
  }

  function handlePartnerCreatedFromLead(partner: Partner, creds: { name: string; username: string; password: string }) {
    if (!convertingLead) return;
    setLeads((prev) =>
      prev.map((lead) => (lead.id === convertingLead.id ? { ...lead, converted_partner_id: partner.id } : lead)),
    );
    setCredentials({ ...creds, whatsappNumber: convertingLead.whatsapp });
    setConvertingLead(null);
  }

  async function handleBgImageUpload(file: File) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      onError("Envie uma imagem .jpg, .png ou .webp.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      onError("A imagem excede o limite de 8MB.");
      return;
    }

    setUploadingBgImage(true);
    setBgImageUploadProgress(0);
    try {
      const prepRes = await fetch("/api/site/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType: file.type }),
      });
      const prepData = await prepRes.json();
      if (!prepRes.ok) {
        onError(prepData.error || "Não foi possível preparar o envio da imagem.");
        return;
      }

      await uploadWithProgress(prepData.signedUrl, file, setBgImageUploadProgress);
      update("bg_media_url", prepData.publicUrl);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Não foi possível enviar a imagem.");
    } finally {
      setUploadingBgImage(false);
      setBgImageUploadProgress(0);
    }
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
      <div className="section-head">
        <h2>Cor, imagem e vídeo de fundo</h2>
      </div>
      <div className="form-card" style={{ marginBottom: 24 }}>
        <div className="field-grid">
          <div className="field span2">
            <label>Cor de fundo</label>
            <input type="color" value={settings.bg_color} onChange={(e) => update("bg_color", e.target.value)} />
          </div>
          <div className="field">
            <label>Mídia de fundo</label>
            <select
              value={settings.bg_media_type}
              onChange={(e) => {
                const nextType = e.target.value as LandingSettings["bg_media_type"];
                setSettings((prev) => {
                  if (!prev) return prev;
                  const suggestOpacity = nextType === "color_video" && prev.bg_media_type !== "color_video";
                  return {
                    ...prev,
                    bg_media_type: nextType,
                    bg_media_opacity: suggestOpacity ? 20 : prev.bg_media_opacity,
                  };
                });
              }}
            >
              <option value="none">Nenhuma (só a cor)</option>
              <option value="image">Imagem</option>
              <option value="video">Vídeo</option>
              <option value="color_video">Cor + vídeo sobreposto (efeito translúcido)</option>
            </select>
          </div>
          {settings.bg_media_type !== "none" && (
            <>
              <div className="field span2">
                <label>
                  URL {settings.bg_media_type === "image" ? "da imagem" : "do vídeo"} de fundo
                  {settings.bg_media_type !== "image" && " (arquivo .mp4/.webm direto — não é link do YouTube/Vimeo)"}
                </label>
                <input
                  value={settings.bg_media_url || ""}
                  onChange={(e) => update("bg_media_url", e.target.value)}
                  placeholder={settings.bg_media_type === "image" ? "https://..." : "https://.../video.mp4"}
                />
              </div>
              {(settings.bg_media_type === "video" || settings.bg_media_type === "color_video") && (
                <div className="field span3">
                  <label>Ou envie um arquivo de vídeo (.mp4 ou .webm, até 50MB)</label>
                  <input
                    type="file"
                    accept="video/mp4,video/webm"
                    disabled={uploadingBgVideo}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleBgVideoUpload(file);
                      e.target.value = "";
                    }}
                  />
                  {uploadingBgVideo && (
                    <div style={{ marginTop: 8 }}>
                      <div
                        style={{
                          height: 6,
                          borderRadius: 3,
                          background: "rgba(127, 127, 127, 0.25)",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${uploadProgress}%`,
                            background: "var(--copper)",
                            transition: "width 0.2s ease",
                          }}
                        />
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                        Enviando vídeo... {uploadProgress}%
                      </div>
                    </div>
                  )}
                </div>
              )}
              {settings.bg_media_type === "image" && (
                <div className="field span3">
                  <label>Ou envie um arquivo de imagem (.jpg, .png ou .webp, até 8MB)</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={uploadingBgImage}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleBgImageUpload(file);
                      e.target.value = "";
                    }}
                  />
                  {uploadingBgImage && (
                    <div style={{ marginTop: 8 }}>
                      <div
                        style={{
                          height: 6,
                          borderRadius: 3,
                          background: "rgba(127, 127, 127, 0.25)",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${bgImageUploadProgress}%`,
                            background: "var(--copper)",
                            transition: "width 0.2s ease",
                          }}
                        />
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                        Enviando imagem... {bgImageUploadProgress}%
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className="field span3">
                <label>
                  {settings.bg_media_type === "color_video"
                    ? `Transparência da cor sobre o vídeo (${settings.bg_media_opacity}% visível — o vídeo fica sempre nítido por baixo)`
                    : `Transparência da mídia de fundo (${settings.bg_media_opacity}% visível)`}
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={settings.bg_media_opacity}
                  onChange={(e) => update("bg_media_opacity", Number(e.target.value))}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="section-head">
        <h2>Títulos</h2>
      </div>
      <div className="form-card" style={{ marginBottom: 24 }}>
        <div className="field-grid">
          <div className="field">
            <label>Texto acima do título (eyebrow)</label>
            <input
              value={settings.hero_eyebrow || ""}
              onChange={(e) => update("hero_eyebrow", e.target.value)}
              placeholder="Toque Aí · Seja um parceiro"
            />
          </div>
          <div className="field span2">
            <label>Título de destaque</label>
            <input
              value={settings.hero_headline || ""}
              onChange={(e) => update("hero_headline", e.target.value)}
              placeholder="Transforme sua loja em ponto de venda Toque Aí"
            />
          </div>
          <div className="field span2">
            <label>Subtítulo</label>
            <textarea
              value={settings.hero_sub || ""}
              onChange={(e) => update("hero_sub", e.target.value)}
              placeholder="Assista ao vídeo e conheça o modelo de parceria..."
              rows={2}
            />
          </div>
          <div className="field">
            <label>Alinhamento do texto</label>
            <select
              value={settings.hero_text_align}
              onChange={(e) => update("hero_text_align", e.target.value as LandingSettings["hero_text_align"])}
            >
              <option value="left">Esquerda</option>
              <option value="center">Centro</option>
              <option value="right">Direita</option>
            </select>
          </div>
          <div className="field">
            <label>Tamanho do título ({settings.hero_headline_size}px)</label>
            <input
              type="range"
              min={16}
              max={72}
              step={1}
              value={settings.hero_headline_size}
              onChange={(e) => update("hero_headline_size", Number(e.target.value))}
            />
          </div>
          <div className="field">
            <label>Cor do título</label>
            <input
              type="color"
              value={settings.hero_headline_color}
              onChange={(e) => update("hero_headline_color", e.target.value)}
            />
          </div>
          <div className="field">
            <label>Largura do título ({settings.hero_headline_width_percent}%)</label>
            <input
              type="range"
              min={30}
              max={100}
              step={5}
              value={settings.hero_headline_width_percent}
              onChange={(e) => update("hero_headline_width_percent", Number(e.target.value))}
            />
          </div>
          <div className="field">
            <label>Tamanho do subtítulo ({settings.hero_sub_size}px)</label>
            <input
              type="range"
              min={11}
              max={32}
              step={1}
              value={settings.hero_sub_size}
              onChange={(e) => update("hero_sub_size", Number(e.target.value))}
            />
          </div>
          <div className="field">
            <label>Cor do subtítulo</label>
            <input
              type="color"
              value={settings.hero_sub_color}
              onChange={(e) => update("hero_sub_color", e.target.value)}
            />
          </div>
          <div className="field">
            <label>Largura do subtítulo ({settings.hero_sub_width_percent}%)</label>
            <input
              type="range"
              min={30}
              max={100}
              step={5}
              value={settings.hero_sub_width_percent}
              onChange={(e) => update("hero_sub_width_percent", Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      <div className="section-head">
        <h2>Vídeo principal e botões</h2>
      </div>
      <div className="form-card" style={{ marginBottom: 24 }}>
        <div className="field-grid">
          <div className="field span2">
            <label>Vídeo (link do YouTube ou Vimeo)</label>
            <input
              value={settings.video_url || ""}
              onChange={(e) => update("video_url", e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>
          <div className="field">
            <label>Largura do vídeo ({settings.video_width_percent}%)</label>
            <input
              type="range"
              min={30}
              max={100}
              step={5}
              value={settings.video_width_percent}
              onChange={(e) => update("video_width_percent", Number(e.target.value))}
            />
          </div>
          <div className="field">
            <label>WhatsApp de destino</label>
            <input
              value={settings.whatsapp_number || ""}
              onChange={(e) => update("whatsapp_number", e.target.value)}
              placeholder="5527900000000"
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
      </div>

      <div className="section-head">
        <h2>Formulário</h2>
      </div>
      <div className="form-card" style={{ marginBottom: 24 }}>
        <div className="field-grid">
          <div className="field">
            <label>Largura do formulário ({settings.form_width_percent}%)</label>
            <input
              type="range"
              min={30}
              max={100}
              step={5}
              value={settings.form_width_percent}
              onChange={(e) => update("form_width_percent", Number(e.target.value))}
            />
          </div>
          <div className="checkbox-group">
            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={settings.form_enabled}
                onChange={(e) => update("form_enabled", e.target.checked)}
              />
              <span>Formulário &quot;Quero ser parceiro&quot; habilitado</span>
            </label>
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
                {lead.converted_partner_id ? (
                  <div className="meta">✅ Virou parceiro</div>
                ) : (
                  <button className="btn" onClick={() => setConvertingLead(lead)} style={{ marginTop: 6 }}>
                    Aprovar e cadastrar como parceiro
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {convertingLead && (
        <div className="pix-modal-overlay">
          <div className="pix-modal-card" style={{ maxWidth: 640 }}>
            <div className="pix-modal-head">
              <div>
                <div className="pix-modal-title">Cadastrar {convertingLead.nome} como parceiro</div>
                <div className="pix-modal-sub">
                  Nome e telefone já vêm preenchidos do cadastro do lead — complete o restante (CPF/CNPJ, comissão, Pix).
                </div>
              </div>
              <button className="btn" onClick={() => setConvertingLead(null)}>
                Cancelar
              </button>
            </div>
            <PartnerForm
              initialValues={{ nome: convertingLead.nome, tel: convertingLead.whatsapp }}
              leadId={convertingLead.id}
              onCreated={handlePartnerCreatedFromLead}
              onError={onError}
            />
          </div>
        </div>
      )}

      {credentials && (
        <CredentialsModal data={credentials} whatsappNumber={credentials.whatsappNumber} onClose={() => setCredentials(null)} />
      )}
    </>
  );
}
