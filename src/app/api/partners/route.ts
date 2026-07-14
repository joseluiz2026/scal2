import { NextResponse } from "next/server";
import { isAdminUser, isValidAuthUserId, usernameToEmail } from "@/lib/auth";
import { generateCredentials } from "@/lib/generateCredentials";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!isAdminUser(userData.user)) {
    return NextResponse.json({ error: "Acesso restrito ao distribuidor." }, { status: 403 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin.from("partners").select("*").order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const partners = await Promise.all(
    (data || []).map(async (p) => {
      if (!isValidAuthUserId(p.auth_user_id)) return { ...p, is_suspended: false };
      const { data: authUser } = await admin.auth.admin.getUserById(p.auth_user_id);
      const bannedUntil = authUser?.user?.banned_until;
      const is_suspended = !!bannedUntil && new Date(bannedUntil) > new Date();
      return { ...p, is_suspended };
    }),
  );

  return NextResponse.json({ partners });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!isAdminUser(userData.user)) {
    return NextResponse.json({ error: "Acesso restrito ao distribuidor." }, { status: 403 });
  }

  const body = await request.json();
  const pessoa = body.pessoa === "PJ" ? "PJ" : "PF";
  const segment = body.segment === "Técnico" ? "Técnico" : "Loja";
  const rate = Number(body.rate);
  const pix = String(body.pix || "").trim();

  if (!rate || rate <= 0 || !pix) {
    return NextResponse.json({ error: "Preencha a comissão (%) e a chave Pix." }, { status: 400 });
  }

  let doc: Record<string, string>;
  let displayName: string;

  if (pessoa === "PF") {
    const nomeCompleto = String(body.nomeCompleto || "").trim();
    const cpf = String(body.cpf || "").trim();
    const telefone = String(body.tel || "").trim();
    if (!nomeCompleto || !cpf || !telefone) {
      return NextResponse.json({ error: "Preencha nome completo, CPF e telefone." }, { status: 400 });
    }
    doc = {
      nome_completo: nomeCompleto,
      cpf,
      rg: String(body.rg || "").trim(),
      telefone,
      email: String(body.email || "").trim(),
    };
    displayName = nomeCompleto;
  } else {
    const razaoSocial = String(body.razaoSocial || "").trim();
    const cnpj = String(body.cnpj || "").trim();
    const telefone = String(body.tel || "").trim();
    if (!razaoSocial || !cnpj || !telefone) {
      return NextResponse.json({ error: "Preencha razão social, CNPJ e telefone." }, { status: 400 });
    }
    const fantasia = String(body.fantasia || "").trim() || razaoSocial;
    doc = {
      razao_social: razaoSocial,
      fantasia,
      cnpj,
      responsavel: String(body.responsavel || "").trim(),
      telefone,
      email: String(body.email || "").trim(),
    };
    displayName = fantasia;
  }

  const admin = createAdminClient();

  for (let attempt = 0; attempt < 5; attempt++) {
    const creds = generateCredentials(displayName);
    const email = usernameToEmail(creds.username);

    const { data: authUser, error: authError } = await admin.auth.admin.createUser({
      email,
      password: creds.password,
      email_confirm: true,
    });

    if (authError) {
      if (authError.message.toLowerCase().includes("already been registered")) continue;
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    const { data: partner, error: insertError } = await admin
      .from("partners")
      .insert({
        auth_user_id: authUser.user.id,
        pessoa,
        segment,
        rate: rate / 100,
        pix,
        username: creds.username,
        ...doc,
      })
      .select()
      .single();

    if (insertError) {
      await admin.auth.admin.deleteUser(authUser.user.id);
      if (insertError.code === "23505") continue;
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ partner, username: creds.username, password: creds.password });
  }

  return NextResponse.json(
    { error: "Não foi possível gerar um usuário único, tente novamente." },
    { status: 500 },
  );
}
