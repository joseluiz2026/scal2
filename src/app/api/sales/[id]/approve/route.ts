import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/auth";
import { commissionRate } from "@/lib/commission";
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
  const monthlyValue = Number(body.monthlyValue);
  const installationValue = Number(body.installationValue) || 0;
  const setupValue = Number(body.setupValue) || 0;
  const boxPortaoValue = Number(body.boxPortaoValue) || 0;
  const boxGaragemValue = Number(body.boxGaragemValue) || 0;

  if (!monthlyValue || monthlyValue <= 0) {
    return NextResponse.json({ error: "Informe o valor mensal cotado antes de aprovar." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: sale, error: saleError } = await admin
    .from("sales")
    .select("*, partners(rate)")
    .eq("id", id)
    .single();

  if (saleError || !sale) return NextResponse.json({ error: "Venda não encontrada." }, { status: 404 });
  if (sale.status !== "aguardando_cotacao") {
    return NextResponse.json({ error: "Essa cotação já foi respondida." }, { status: 400 });
  }

  const rate = commissionRate(sale.kind, sale.client_data, sale.partners.rate);
  const commissionPerMonth = monthlyValue * rate;
  const oneTimeCommission = installationValue + setupValue > 0 ? 100 : 0;

  const { error: updateError } = await admin
    .from("sales")
    .update({
      monthly_value: monthlyValue,
      installation_value: installationValue,
      setup_value: setupValue,
      box_portao_value: boxPortaoValue,
      box_garagem_value: boxGaragemValue,
      status: "active",
      one_time_status: oneTimeCommission > 0 ? "due" : null,
    })
    .eq("id", id);

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  const installments = Array.from({ length: 12 }, (_, i) => ({
    sale_id: id,
    month: i + 1,
    amount: commissionPerMonth,
    status: i === 0 ? "due" : "future",
  }));

  const { error: instError } = await admin.from("installments").insert(installments);
  if (instError) return NextResponse.json({ error: instError.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
