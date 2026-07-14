import { NextResponse } from "next/server";
import { ADMIN_USERNAME, usernameToEmail } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { username, password } = await request.json();

  if (!username || !password) {
    return NextResponse.json({ error: "Preencha usuário e senha." }, { status: 400 });
  }

  const supabase = await createClient();
  const email = usernameToEmail(String(username).trim());

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.session) {
    return NextResponse.json({ error: "Usuário ou senha inválidos." }, { status: 401 });
  }

  const role = username === ADMIN_USERNAME ? "admin" : "partner";
  return NextResponse.json({ ok: true, role });
}
