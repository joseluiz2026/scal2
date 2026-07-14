import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/auth";
import { getPartnerByAuthId } from "@/lib/currentPartner";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user || isAdminUser(userData.user)) {
    return NextResponse.json({ error: "Apenas parceiros." }, { status: 403 });
  }

  const partner = await getPartnerByAuthId(userData.user.id);
  if (!partner) return NextResponse.json({ error: "Parceiro não encontrado." }, { status: 404 });

  return NextResponse.json({ partner });
}
