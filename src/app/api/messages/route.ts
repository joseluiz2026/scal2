import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/auth";
import { getPartnerByAuthId } from "@/lib/currentPartner";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const admin = createAdminClient();

  if (isAdminUser(userData.user)) {
    const { data, error } = await admin
      .from("messages")
      .select("*, message_reads(partner_id)")
      .order("created_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ messages: data });
  }

  const partner = await getPartnerByAuthId(userData.user.id);
  if (!partner) return NextResponse.json({ error: "Parceiro não encontrado." }, { status: 404 });

  const { data, error } = await admin
    .from("messages")
    .select("*, message_reads(partner_id)")
    .or(`partner_id.is.null,partner_id.eq.${partner.id}`)
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ messages: data });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!isAdminUser(userData.user)) {
    return NextResponse.json({ error: "Acesso restrito ao distribuidor." }, { status: 403 });
  }

  const body = await request.json();
  const title = String(body.title || "").trim();
  const msgBody = String(body.body || "").trim();
  const partnerId = body.partnerId || null;

  if (!title || !msgBody) {
    return NextResponse.json({ error: "Preencha o título e a mensagem." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("messages")
    .insert({ partner_id: partnerId, title, body: msgBody })
    .select("*, message_reads(partner_id)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: data });
}
