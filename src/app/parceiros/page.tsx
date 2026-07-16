import { createAdminClient } from "@/lib/supabase/admin";
import type { LandingSettings } from "@/lib/types";
import LandingForm from "@/components/landing/LandingForm";
import "./landing.css";

export const dynamic = "force-dynamic";

const DEFAULT_SETTINGS: LandingSettings = {
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
  video_orientation: "horizontal",
  updated_at: new Date(0).toISOString(),
};

async function getSettings(): Promise<LandingSettings> {
  const admin = createAdminClient();
  const { data } = await admin.from("landing_settings").select("*").eq("id", 1).maybeSingle();
  return data || DEFAULT_SETTINGS;
}

export default async function ParceirosPage() {
  const settings = await getSettings();

  return <LandingForm settings={settings} />;
}
