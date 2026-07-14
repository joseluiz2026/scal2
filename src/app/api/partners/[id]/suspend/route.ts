import { NextResponse } from "next/server";
import { isAdminUser, isValidAuthUserId } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!isAdminUser(userData.user)) {
    return NextResponse.json({ error: "Acesso restrito ao distribuidor." }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const suspended = !!body.suspended;

  const admin = createAdminClient();
  const { data: partner, error: fetchError } = await admin.from("partners").select("auth_user_id").eq("id", id).maybeSingle();
  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 });
  if (!partner) return NextResponse.json({ error: "Parceiro não encontrado." }, { status: 404 });
  if (!isValidAuthUserId(partner.auth_user_id)) {
    return NextResponse.json({ error: "Esse parceiro de demonstração não tem um login real para suspender." }, { status: 400 });
  }

  const { error } = await admin.auth.admin.updateUserById(partner.auth_user_id, {
    ban_duration: suspended ? "876000h" : "none",
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, suspended });
}
