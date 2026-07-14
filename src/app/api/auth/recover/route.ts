import { NextResponse } from "next/server";
import { generatePassword } from "@/lib/generateCredentials";
import { createAdminClient } from "@/lib/supabase/admin";

function onlyDigits(value: string) {
  return String(value || "").replace(/\D/g, "");
}

export async function POST(request: Request) {
  const body = await request.json();
  const username = String(body.username || "").trim();
  const document = onlyDigits(body.document || "");

  if (!username || !document) {
    return NextResponse.json({ error: "Preencha usuário e CPF/CNPJ." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: partner } = await admin.from("partners").select("*").eq("username", username).maybeSingle();

  const partnerDoc = partner ? onlyDigits(partner.pessoa === "PF" ? partner.cpf : partner.cnpj) : "";
  if (!partner || !partnerDoc || partnerDoc !== document) {
    return NextResponse.json({ error: "Usuário ou CPF/CNPJ não conferem." }, { status: 401 });
  }

  const newPassword = generatePassword();
  const { error } = await admin.auth.admin.updateUserById(partner.auth_user_id, { password: newPassword });
  if (error) return NextResponse.json({ error: "Não foi possível gerar a nova senha. Tente novamente." }, { status: 500 });

  const displayName = partner.pessoa === "PF" ? partner.nome_completo : partner.fantasia;
  return NextResponse.json({ name: displayName, username: partner.username, password: newPassword });
}
