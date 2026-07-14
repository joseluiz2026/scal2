import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/auth";
import { getPartnerByAuthId } from "@/lib/currentPartner";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user || isAdminUser(userData.user)) {
    return NextResponse.json({ error: "Apenas parceiros." }, { status: 403 });
  }

  const partner = await getPartnerByAuthId(userData.user.id);
  if (!partner) return NextResponse.json({ error: "Parceiro não encontrado." }, { status: 404 });

  const { id } = await params;
  const admin = createAdminClient();

  const { data: inst, error: instError } = await admin
    .from("installments")
    .select("id, sales!inner(partner_id)")
    .eq("id", id)
    .single();
  if (instError || !inst) return NextResponse.json({ error: "Parcela não encontrada." }, { status: 404 });
  const sale = inst.sales as unknown as { partner_id: string };
  if (sale.partner_id !== partner.id) {
    return NextResponse.json({ error: "Essa parcela não pertence a você." }, { status: 403 });
  }

  const { error } = await admin
    .from("installments")
    .update({ receipt_confirmed: true, receipt_confirmed_at: new Date().toISOString() })
    .eq("id", id)
    .not("receipt_url", "is", null);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
