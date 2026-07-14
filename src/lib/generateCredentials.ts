const CRED_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
const DIACRITICS = new RegExp("[\\u0300-\\u036f]", "g");

export function generatePassword() {
  const n2 = Math.floor(10 + Math.random() * 90);
  let password = "";
  for (let i = 0; i < 6; i++) {
    password += CRED_CHARS[Math.floor(Math.random() * CRED_CHARS.length)];
  }
  return `${password}#${n2}`;
}

export function generateCredentials(name: string) {
  const base = (name || "")
    .normalize("NFD")
    .replace(DIACRITICS, "")
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .join(".");

  const n1 = Math.floor(10 + Math.random() * 90);
  const username = (base || "parceiro") + n1;

  return { username, password: generatePassword() };
}
