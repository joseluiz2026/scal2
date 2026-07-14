import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!isAdminUser(userData.user)) {
    return NextResponse.json({ error: "Acesso restrito ao distribuidor." }, { status: 403 });
  }

  const { id } = await params;
  const admin = createAdminClient();

  const { data: partner, error: fetchError } = await admin.from("partners").select("auth_user_id").eq("id", id).maybeSingle();
  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 });
  if (!partner) return NextResponse.json({ error: "Parceiro não encontrado." }, { status: 404 });

  const { error: deleteError } = await admin.from("partners").delete().eq("id", id);
  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });

  await admin.auth.admin.deleteUser(partner.auth_user_id);

  return NextResponse.json({ ok: true });
}
