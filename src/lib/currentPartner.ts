import { createAdminClient } from "./supabase/admin";

export async function getPartnerByAuthId(authUserId: string) {
  const admin = createAdminClient();
  const { data } = await admin.from("partners").select("*").eq("auth_user_id", authUserId).single();
  return data;
}
