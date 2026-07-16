import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/auth";
import { createPublicUploadUrl, publicFileUrl } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_TYPES: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!isAdminUser(userData.user)) {
    return NextResponse.json({ error: "Acesso restrito ao distribuidor." }, { status: 403 });
  }

  const body = await request.json();
  const contentType = String(body.contentType || "");
  const extension = ALLOWED_TYPES[contentType];
  if (!extension) {
    return NextResponse.json({ error: "Envie um arquivo .mp4 ou .webm." }, { status: 400 });
  }

  const path = `bg-media/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;

  try {
    const { path: storedPath, token, signedUrl } = await createPublicUploadUrl(path);
    return NextResponse.json({ path: storedPath, token, signedUrl, publicUrl: publicFileUrl(storedPath) });
  } catch {
    return NextResponse.json({ error: "Não foi possível preparar o envio do vídeo." }, { status: 500 });
  }
}
