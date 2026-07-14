export const ADMIN_USERNAME = "joseluizweb";

export function usernameToEmail(username: string) {
  if (username === ADMIN_USERNAME) return `${ADMIN_USERNAME}@toqueai.local`;
  return `${username}@parceiros.scal.local`;
}

export function isAdminUser(user: { email?: string | null } | null | undefined) {
  return !!user && user.email === usernameToEmail(ADMIN_USERNAME);
}
