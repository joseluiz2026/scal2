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
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ settings: data });
}
