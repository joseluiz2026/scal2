"use client";

import { useEffect, useState } from "react";
import type { SiteSettings } from "@/lib/types";
import { DEFAULT_SITE_SETTINGS } from "@/lib/siteSettings";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

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

export default function SiteAdmin({ onError }: { onError: (message: string) => void }) {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<keyof SiteSettings | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetch("/api/site/settings")
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) onError(data.error || "Não foi possível carregar as configurações do site.");
        setSettings(ok ? data.settings : DEFAULT_SITE_SETTINGS);
      })
      .catch(() => {
        onError("Não foi possível conectar. Tente novamente.");
        setSettings(DEFAULT_SITE_SETTINGS);
      })
      .finally(() => setLoading(false));
  }, [onError]);

  function update<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    try {
      const res = await fetch("/api/site/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) {
        onError(data.error || "Não foi possível salvar as configurações do site.");
        return;
      }
      setSettings(data.settings);
    } catch {
      onError("Não foi possível conectar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  async function handleImageUpload(file: File, field: keyof SiteSettings) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      onError("Envie uma imagem .jpg, .png ou .webp.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      onError("A imagem excede o limite de 8MB.");
      return;
    }

    setUploadingField(field);
    setUploadProgress(0);
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

      await uploadWithProgress(prepData.signedUrl, file, setUploadProgress);
      update(field, prepData.publicUrl);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Não foi possível enviar a imagem.");
    } finally {
      setUploadingField(null);
      setUploadProgress(0);
    }
  }

  function renderImageField(field: keyof SiteSettings, label: string, span: "span2" | "span3" | "") {
    if (!settings) return null;
    const isUploading = uploadingField === field;
    return (
      <div className={`field ${span}`.trim()} key={field}>
        <label>{label}</label>
        <input value={String(settings[field] ?? "")} onChange={(e) => update(field, e.target.value)} placeholder="https://..." />
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={isUploading}
          style={{ marginTop: 8 }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageUpload(file, field);
            e.target.value = "";
          }}
        />
        {isUploading && (
          <div style={{ marginTop: 8 }}>
            <div style={{ height: 6, borderRadius: 3, background: "rgba(127, 127, 127, 0.25)", overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${uploadProgress}%`,
                  background: "var(--copper)",
                  transition: "width 0.2s ease",
                }}
              />
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>Enviando imagem... {uploadProgress}%</div>
          </div>
        )}
      </div>
    );
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
        <h2>Textos do topo</h2>
      </div>
      <div className="form-card" style={{ marginBottom: 24 }}>
        <div className="field-grid">
          <div className="field span3">
            <label>Texto acima do título (eyebrow)</label>
            <input
              value={settings.hero_eyebrow}
              onChange={(e) => update("hero_eyebrow", e.target.value)}
              placeholder="OPORTUNIDADE EXCLUSIVA NO ES"
            />
          </div>
          <div className="field span2">
            <label>Título (parte normal)</label>
            <input
              value={settings.hero_headline}
              onChange={(e) => update("hero_headline", e.target.value)}
              placeholder="Transforme sua carteira em uma"
            />
          </div>
          <div className="field">
            <label>Título (parte destacada em verde)</label>
            <input
              value={settings.hero_headline_highlight}
              onChange={(e) => update("hero_headline_highlight", e.target.value)}
              placeholder="renda recorrente."
            />
          </div>
          <div className="field span3">
            <label>Subtítulo</label>
            <textarea
              value={settings.hero_sub}
              onChange={(e) => update("hero_sub", e.target.value)}
              rows={2}
            />
          </div>
          <div className="field span3">
            <label>Texto de urgência (perto do botão final)</label>
            <input
              value={settings.slots_text}
              onChange={(e) => update("slots_text", e.target.value)}
              placeholder="Últimas 5 vagas para o treinamento de Janeiro"
            />
          </div>
        </div>
      </div>

      <div className="section-head">
        <h2>Imagens</h2>
      </div>
      <div className="form-card" style={{ marginBottom: 24 }}>
        <div className="field-grid">
          {renderImageField("logo_url", "Logo (usada no topo e no rodapé)", "span3")}
          {renderImageField("hero_image_url", "Imagem de fundo do topo (hero)", "span3")}
          {renderImageField("gallery_url_1", "Galeria — foto 1", "")}
          {renderImageField("gallery_url_2", "Galeria — foto 2", "")}
          {renderImageField("gallery_url_3", "Galeria — foto 3", "")}
        </div>
        <div className="submit-row">
          <a className="btn" href="/site" target="_blank" rel="noopener noreferrer">
            👁️ Ver página
          </a>
          <button className="btn primary" onClick={handleSave} disabled={saving} style={{ marginLeft: 8 }}>
            {saving ? "Salvando..." : "Salvar configurações"}
          </button>
        </div>
      </div>
    </>
  );
}
