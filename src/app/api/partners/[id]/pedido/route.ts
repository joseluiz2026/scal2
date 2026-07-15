import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/auth";
import { getPartnerByAuthId } from "@/lib/currentPartner";
import { signedUrl, uploadFile } from "@/lib/storage";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

function prefixFor(partnerId: string) {
  return `pedidos-fornecedor/${partnerId}`;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { id } = await params;

  if (!isAdminUser(userData.user)) {
    const partner = await getPartnerByAuthId(userData.user.id);
    if (!partner || partner.id !== id) {
      return NextResponse.json({ error: "Acesso restrito." }, { status: 403 });
    }
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("pedidos")
    .select("*")
    .eq("partner_id", id)
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const pedidos = await Promise.all(
    (data || []).map(async (p) => ({
      id: p.id,
      createdAt: p.created_at,
      clientsCount: p.clients_count,
      installed: p.installed,
      installedAt: p.installed_at,
      signedUrl: await signedUrl(p.file_path),
    })),
  );

  return NextResponse.json({ pedidos });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!isAdminUser(userData.user)) {
    return NextResponse.json({ error: "Acesso restrito ao distribuidor." }, { status: 403 });
  }

  const { id } = await params;
  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Nenhum arquivo recebido." }, { status: 400 });
  }
  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "Apenas arquivos PDF são aceitos." }, { status: 400 });
  }
  const MAX_SIZE = 10 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Arquivo muito grande (máximo 10MB)." }, { status: 400 });
  }
  const clientsCount = Number(formData.get("clientsCount")) || 0;

  const path = `${prefixFor(id)}/${Date.now()}.pdf`;
  try {
    await uploadFile(path, file);
  } catch {
    return NextResponse.json({ error: "Não foi possível arquivar o pedido." }, { status: 500 });
  }

  const admin = createAdminClient();
  const { error: insertError } = await admin
    .from("pedidos")
    .insert({ partner_id: id, file_path: path, clients_count: clientsCount });
  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

  return NextResponse.json({ ok: true, path });
}
