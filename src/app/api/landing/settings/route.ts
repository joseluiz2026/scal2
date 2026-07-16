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
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ settings: data });
}
