import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!isAdminUser(userData.user)) {
    return NextResponse.json({ error: "Acesso restrito ao distribuidor." }, { status: 403 });
  }

  const { id } = await params;
  const admin = createAdminClient();

  const { data: inst, error: instError } = await admin.from("installments").select("*").eq("id", id).single();
  if (instError || !inst) return NextResponse.json({ error: "Parcela não encontrada." }, { status: 404 });
  if (inst.status !== "due") return NextResponse.json({ error: "Essa parcela não está pendente." }, { status: 400 });

  const { error: updateError } = await admin
    .from("installments")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("id", id);
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  const { error: nextError } = await admin
    .from("installments")
    .update({ status: "due" })
    .eq("sale_id", inst.sale_id)
    .eq("month", inst.month + 1)
    .eq("status", "future");
  if (nextError) return NextResponse.json({ error: nextError.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
