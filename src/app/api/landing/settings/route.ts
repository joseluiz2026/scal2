import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const DEFAULT_SETTINGS = {
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
  video_width_percent: 70,
  form_width_percent: 50,
  updated_at: new Date(0).toISOString(),
};

export async function GET() {
  const admin = createAdminClient();
  const { data, error } = await admin.from("landing_settings").select("*").eq("id", 1).maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ settings: data || DEFAULT_SETTINGS });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!isAdminUser(userData.user)) {
    return NextResponse.json({ error: "Acesso restrito ao distribuidor." }, { status: 403 });
  }

  const body = await request.json();
  const bg_color = String(body.bg_color || "#0A121C").trim().slice(0, 20);
  const video_url = String(body.video_url || "").trim().slice(0, 500);
  const web_link_url = String(body.web_link_url || "").trim().slice(0, 500);
  const web_link_label = String(body.web_link_label || "Saiba mais").trim().slice(0, 60);
  const whatsapp_number = String(body.whatsapp_number || "").replace(/\D/g, "").slice(0, 20);
  const show_web_link_button = Boolean(body.show_web_link_button);
  const show_whatsapp_button = Boolean(body.show_whatsapp_button);
  const button_reveal_percent = Math.min(100, Math.max(0, Math.round(Number(body.button_reveal_percent) || 0)));
  const bg_media_type = ["image", "video", "color_video"].includes(body.bg_media_type) ? body.bg_media_type : "none";
  const bg_media_url = String(body.bg_media_url || "").trim().slice(0, 500);
  const bg_media_opacity = Math.min(100, Math.max(0, Math.round(Number(body.bg_media_opacity) ?? 100)));
  const hero_eyebrow = String(body.hero_eyebrow || "").trim().slice(0, 80);
  const hero_headline = String(body.hero_headline || "").trim().slice(0, 160);
  const hero_sub = String(body.hero_sub || "").trim().slice(0, 300);
  const hero_headline_size = Math.min(72, Math.max(16, Math.round(Number(body.hero_headline_size) || 34)));
  const hero_headline_color = /^#[0-9a-fA-F]{6}$/.test(body.hero_headline_color) ? body.hero_headline_color : "#EEF2F7";
  const hero_sub_size = Math.min(32, Math.max(11, Math.round(Number(body.hero_sub_size) || 15)));
  const hero_sub_color = /^#[0-9a-fA-F]{6}$/.test(body.hero_sub_color) ? body.hero_sub_color : "#C9D3DE";
  const hero_text_align = ["left", "center", "right"].includes(body.hero_text_align) ? body.hero_text_align : "left";
  const video_width_percent = Math.min(100, Math.max(30, Math.round(Number(body.video_width_percent) || 70)));
  const form_width_percent = Math.min(100, Math.max(30, Math.round(Number(body.form_width_percent) || 50)));

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("landing_settings")
    .upsert({
      id: 1,
      bg_color,
      video_url,
      web_link_url,
      web_link_label,
      whatsapp_number,
      show_web_link_button,
      show_whatsapp_button,
      button_reveal_percent,
      bg_media_type,
      bg_media_url,
      bg_media_opacity,
      hero_eyebrow,
      hero_headline,
      hero_sub,
      hero_headline_size,
      hero_headline_color,
      hero_sub_size,
      hero_sub_color,
      hero_text_align,
      video_width_percent,
      form_width_percent,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ settings: data });
}
