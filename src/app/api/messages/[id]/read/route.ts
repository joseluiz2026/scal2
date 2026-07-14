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
  const { error } = await admin
    .from("message_reads")
    .upsert({ message_id: id, partner_id: partner.id }, { onConflict: "message_id,partner_id" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
