import { NextResponse } from "next/server";
import { isAdminUser, isValidAuthUserId, usernameToEmail } from "@/lib/auth";
import { generatePassword } from "@/lib/generateCredentials";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!isAdminUser(userData.user)) {
    return NextResponse.json({ error: "Acesso restrito ao distribuidor." }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const admin = createAdminClient();

  const { data: partner, error: fetchError } = await admin.from("partners").select("*").eq("id", id).maybeSingle();
  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 });
  if (!partner) return NextResponse.json({ error: "Parceiro não encontrado." }, { status: 404 });

  const wantsUsernameChange =
    typeof body.username === "string" && body.username.trim() && body.username.trim() !== partner.username;
  if ((wantsUsernameChange || body.regeneratePassword) && !isValidAuthUserId(partner.auth_user_id)) {
    return NextResponse.json({ error: "Esse parceiro de demonstração não tem um login real para editar." }, { status: 400 });
  }

  let newUsername: string | undefined;
  let newPassword: string | undefined;

  if (wantsUsernameChange) {
    const trimmedUsername: string = body.username.trim();
    newUsername = trimmedUsername;
    const { error: usernameError } = await admin.from("partners").update({ username: trimmedUsername }).eq("id", id);
    if (usernameError) {
      const message = usernameError.code === "23505" ? "Esse nome de usuário já está em uso." : usernameError.message;
      return NextResponse.json({ error: message }, { status: 400 });
    }
    const { error: emailError } = await admin.auth.admin.updateUserById(partner.auth_user_id, {
      email: usernameToEmail(trimmedUsername),
    });
    if (emailError) return NextResponse.json({ error: emailError.message }, { status: 500 });
  }

  if (body.regeneratePassword) {
    newPassword = generatePassword();
    const { error: passwordError } = await admin.auth.admin.updateUserById(partner.auth_user_id, { password: newPassword });
    if (passwordError) return NextResponse.json({ error: passwordError.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    username: newUsername || partner.username,
    password: newPassword,
  });
}

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
