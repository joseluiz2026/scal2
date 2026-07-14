export const ADMIN_USERNAME = "joseluizweb";

export function usernameToEmail(username: string) {
  if (username === ADMIN_USERNAME) return `${ADMIN_USERNAME}@toqueai.local`;
  return `${username}@parceiros.scal.local`;
}

export function isAdminUser(user: { email?: string | null } | null | undefined) {
  return !!user && user.email === usernameToEmail(ADMIN_USERNAME);
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidAuthUserId(id: string | null | undefined) {
  return !!id && UUID_PATTERN.test(id);
}
