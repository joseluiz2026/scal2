import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/auth";
import { signedUrl } from "@/lib/storage";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!isAdminUser(userData.user)) {
    return NextResponse.json({ error: "Acesso restrito ao distribuidor." }, { status: 403 });
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("pedidos")
    .select("*, partners(id, pessoa, nome_completo, fantasia, is_demo)")
    .eq("installed", true)
    .gte("installed_at", startOfMonth)
    .order("installed_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const pedidos = await Promise.all(
    (data || []).map(async (p) => ({
      id: p.id,
      createdAt: p.created_at,
      clientsCount: p.clients_count,
      installed: p.installed,
      installedAt: p.installed_at,
      signedUrl: await signedUrl(p.file_path),
      partner: p.partners,
    })),
  );

  return NextResponse.json({ pedidos });
}
