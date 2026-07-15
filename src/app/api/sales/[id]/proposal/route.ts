import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/auth";
import { getPartnerByAuthId } from "@/lib/currentPartner";
import { uploadFile } from "@/lib/storage";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user || isAdminUser(userData.user)) {
    return NextResponse.json({ error: "Apenas parceiros." }, { status: 403 });
  }

  const partner = await getPartnerByAuthId(userData.user.id);
  if (!partner) return NextResponse.json({ error: "Parceiro não encontrado." }, { status: 404 });

  const { id } = await params;
  const admin = createAdminClient();

  const { data: sale, error: fetchError } = await admin
    .from("sales")
    .select("id, partner_id, kind, status")
    .eq("id", id)
    .maybeSingle();
  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 });
  if (!sale) return NextResponse.json({ error: "Venda não encontrada." }, { status: 404 });
  if (sale.partner_id !== partner.id) {
    return NextResponse.json({ error: "Essa venda não pertence a você." }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Selecione um arquivo." }, { status: 400 });
  }
  if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
    return NextResponse.json({ error: "Envie uma imagem ou um PDF." }, { status: 400 });
  }
  const MAX_SIZE = 10 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Arquivo muito grande (máximo 10MB)." }, { status: 400 });
  }

  const path = `proposta/${id}-${Date.now()}-${file.name}`;
  try {
    await uploadFile(path, file);
  } catch {
    return NextResponse.json({ error: "Não foi possível enviar o arquivo." }, { status: 500 });
  }

  const { error: updateError } = await admin
    .from("sales")
    .update({ proposal_url: path, proposal_confirmed: false, proposal_confirmed_at: null })
    .eq("id", id);
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
