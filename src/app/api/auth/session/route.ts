import { NextResponse } from "next/server";
import { ADMIN_USERNAME, isAdminUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return NextResponse.json({ user: null });
  }

  const isAdmin = isAdminUser(data.user);
  return NextResponse.json({
    user: {
      role: isAdmin ? "admin" : "partner",
      username: isAdmin ? ADMIN_USERNAME : data.user.email?.split("@")[0],
    },
  });
}
