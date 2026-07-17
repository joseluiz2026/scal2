import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_SITE_SETTINGS } from "@/lib/siteSettings";

export async function GET() {
  const admin = createAdminClient();
  const { data, error } = await admin.from("site_settings").select("*").eq("id", 1).maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ settings: data || DEFAULT_SITE_SETTINGS });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!isAdminUser(userData.user)) {
    return NextResponse.json({ error: "Acesso restrito ao distribuidor." }, { status: 403 });
  }

  const body = await request.json();
  const hero_eyebrow = String(body.hero_eyebrow || "").trim().slice(0, 80);
  const hero_headline = String(body.hero_headline || "").trim().slice(0, 160);
  const hero_headline_highlight = String(body.hero_headline_highlight || "").trim().slice(0, 80);
  const hero_sub = String(body.hero_sub || "").trim().slice(0, 400);
  const slots_text = String(body.slots_text || "").trim().slice(0, 120);
  const logo_url = String(body.logo_url || "").trim().slice(0, 500);
  const hero_image_url = String(body.hero_image_url || "").trim().slice(0, 500);
  const gallery_url_1 = String(body.gallery_url_1 || "").trim().slice(0, 500);
  const gallery_url_2 = String(body.gallery_url_2 || "").trim().slice(0, 500);
  const gallery_url_3 = String(body.gallery_url_3 || "").trim().slice(0, 500);

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("site_settings")
    .upsert({
      id: 1,
      hero_eyebrow,
      hero_headline,
      hero_headline_highlight,
      hero_sub,
      slots_text,
      logo_url,
      hero_image_url,
      gallery_url_1,
      gallery_url_2,
      gallery_url_3,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ settings: data });
}
