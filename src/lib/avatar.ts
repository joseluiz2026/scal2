export function hashSeed(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function avatarColors(seedStr: string) {
  const hash = hashSeed(seedStr);
  const hue = hash % 360;
  const isLightBg = hash % 2 === 0;
  const bgColor = `hsl(${hue}, 62%, ${isLightBg ? 82 : 26}%)`;
  const textColor = `hsl(${(hue + 180) % 360}, 70%, ${isLightBg ? 18 : 90}%)`;
  return { bgColor, textColor };
}

export function getInitials(name: string) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "??";
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
