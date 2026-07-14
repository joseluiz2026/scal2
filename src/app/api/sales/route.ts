import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/auth";
import { getPartnerByAuthId } from "@/lib/currentPartner";
import { withSignedUrls } from "@/lib/storage";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Installment } from "@/lib/types";

export async function GET() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const admin = createAdminClient();

  if (isAdminUser(userData.user)) {
    const { data, error } = await admin
      .from("sales")
      .select("*, installments(*), partners(id, pessoa, nome_completo, fantasia, segment, rate)")
      .order("created_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const sales = await Promise.all(
      (data || []).map(async (s) => ({ ...s, installments: await withSignedUrls((s.installments || []) as Installment[]) })),
    );
    return NextResponse.json({ sales });
  }

  const partner = await getPartnerByAuthId(userData.user.id);
  if (!partner) return NextResponse.json({ error: "Parceiro não encontrado." }, { status: 404 });

  const { data, error } = await admin
    .from("sales")
    .select("*, installments(*)")
    .eq("partner_id", partner.id)
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const sales = await Promise.all(
    (data || []).map(async (s) => ({ ...s, installments: await withSignedUrls((s.installments || []) as Installment[]) })),
  );
  return NextResponse.json({ sales });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user || isAdminUser(userData.user)) {
    return NextResponse.json({ error: "Apenas parceiros podem solicitar cotação." }, { status: 403 });
  }

  const partner = await getPartnerByAuthId(userData.user.id);
  if (!partner) return NextResponse.json({ error: "Parceiro não encontrado." }, { status: 404 });

  const body = await request.json();
  const kind = body.kind === "condominial" ? "condominial" : "residencial";
  const client = body.client || {};

  if (kind === "residencial") {
    if (!String(client.nomeCompleto || "").trim() || !String(client.cpf || "").trim() || !String(client.endereco || "").trim() || !String(client.tel1 || "").trim()) {
      return NextResponse.json({ error: "Preencha nome, CPF, endereço e ao menos 1 telefone." }, { status: 400 });
    }
  } else {
    if (!String(client.responsavel || "").trim() || !String(client.nomeCondominio || "").trim() || !String(client.cnpj || "").trim() || !String(client.endereco || "").trim()) {
      return NextResponse.json({ error: "Preencha responsável, nome do condomínio, CNPJ e endereço." }, { status: 400 });
    }
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("sales")
    .insert({
      partner_id: partner.id,
      kind,
      client_data: client,
      status: "aguardando_cotacao",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ sale: data });
}
