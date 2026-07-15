import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/auth";
import { getPartnerByAuthId } from "@/lib/currentPartner";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { id } = await params;
  const admin = createAdminClient();

  const { data: pedido, error: fetchError } = await admin
    .from("pedidos")
    .select("partner_id")
    .eq("id", id)
    .maybeSingle();
  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 });
  if (!pedido) return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });

  if (!isAdminUser(userData.user)) {
    const partner = await getPartnerByAuthId(userData.user.id);
    if (!partner || partner.id !== pedido.partner_id) {
      return NextResponse.json({ error: "Esse pedido não pertence a você." }, { status: 403 });
    }
  }

  const body = await request.json();
  const installed = !!body.installed;

  const { error: updateError } = await admin
    .from("pedidos")
    .update({ installed, installed_at: installed ? new Date().toISOString() : null })
    .eq("id", id);
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
