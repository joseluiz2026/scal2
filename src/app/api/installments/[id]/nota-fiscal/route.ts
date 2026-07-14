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

  const { data: inst, error: instError } = await admin
    .from("installments")
    .select("id, sale_id, sales!inner(partner_id)")
    .eq("id", id)
    .single();
  if (instError || !inst) return NextResponse.json({ error: "Parcela não encontrada." }, { status: 404 });
  const sale = inst.sales as unknown as { partner_id: string };
  if (sale.partner_id !== partner.id) {
    return NextResponse.json({ error: "Essa parcela não pertence a você." }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Selecione um arquivo." }, { status: 400 });
  }

  const path = `nota-fiscal/${id}-${Date.now()}-${file.name}`;
  try {
    await uploadFile(path, file);
  } catch {
    return NextResponse.json({ error: "Não foi possível enviar o arquivo." }, { status: 500 });
  }

  const { error: updateError } = await admin
    .from("installments")
    .update({ nota_fiscal_url: path, nota_fiscal_conferred: false })
    .eq("id", id);
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
