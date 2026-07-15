import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!isAdminUser(userData.user)) {
    return NextResponse.json({ error: "Acesso restrito ao distribuidor." }, { status: 403 });
  }

  const { id } = await params;
  const admin = createAdminClient();
  const { error } = await admin
    .from("sales")
    .update({ proposal_confirmed: true, proposal_confirmed_at: new Date().toISOString() })
    .eq("id", id)
    .not("proposal_url", "is", null);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
