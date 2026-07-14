import { avatarColors, getInitials } from "@/lib/avatar";

export default function Avatar({
  seed,
  name,
  size = 40,
  avatarUrl,
}: {
  seed: string;
  name: string;
  size?: number;
  avatarUrl?: string | null;
}) {
  if (avatarUrl) {
    return (
      <div className="avatar" style={{ width: size, height: size }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={avatarUrl} alt="" />
      </div>
    );
  }

  const { bgColor, textColor } = avatarColors(seed);
  const initials = getInitials(name);
  const fontSize = Math.round(size * 0.4);

  return (
    <div
      className="avatar"
      style={{ width: size, height: size, background: bgColor, color: textColor, fontSize }}
    >
      {initials}
    </div>
  );
}
