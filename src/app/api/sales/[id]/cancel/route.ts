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

  const { error: saleError } = await admin.from("sales").update({ status: "cancelled" }).eq("id", id);
  if (saleError) return NextResponse.json({ error: saleError.message }, { status: 500 });

  const { error: instError } = await admin
    .from("installments")
    .update({ status: "cancelled" })
    .eq("sale_id", id)
    .in("status", ["due", "future"]);
  if (instError) return NextResponse.json({ error: instError.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
