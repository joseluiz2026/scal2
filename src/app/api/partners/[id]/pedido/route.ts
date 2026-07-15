import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/auth";
import { listSignedFiles, uploadFile } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";

function prefixFor(partnerId: string) {
  return `pedidos-fornecedor/${partnerId}`;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!isAdminUser(userData.user)) {
    return NextResponse.json({ error: "Acesso restrito ao distribuidor." }, { status: 403 });
  }

  const { id } = await params;
  const files = await listSignedFiles(prefixFor(id));
  return NextResponse.json({ files });
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

  const path = `${prefixFor(id)}/${Date.now()}.pdf`;
  try {
    await uploadFile(path, file);
  } catch {
    return NextResponse.json({ error: "Não foi possível arquivar o pedido." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, path });
}
