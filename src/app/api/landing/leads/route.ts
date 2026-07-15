import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!isAdminUser(userData.user)) {
    return NextResponse.json({ error: "Acesso restrito ao distribuidor." }, { status: 403 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("landing_leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ leads: data || [] });
}

export async function POST(request: Request) {
  const body = await request.json();
  const nome = String(body.nome || "").trim().slice(0, 200);
  const whatsapp = String(body.whatsapp || "").trim().slice(0, 40);
  const cidade = String(body.cidade || "").trim().slice(0, 200);

  if (!nome || !whatsapp) {
    return NextResponse.json({ error: "Preencha nome e WhatsApp." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("landing_leads")
    .insert({ nome, whatsapp, cidade: cidade || null })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ lead: data });
}
