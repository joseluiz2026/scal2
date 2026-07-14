import { hashSeed } from "@/lib/avatar";

export default function Sparkline({ seed, color, w = 64, h = 26 }: { seed: string; color: string; w?: number; h?: number }) {
  const hash = hashSeed(seed);
  const n = 8;
  const points: number[] = [];
  for (let i = 0; i < n; i++) {
    points.push(0.28 + 0.58 * Math.abs(Math.sin(((hash % 97) + i * 41) / 11.5)));
  }
  const stepX = w / (n - 1);
  const coords = points.map((v, i) => `${(i * stepX).toFixed(1)},${(h - v * h).toFixed(1)}`).join(" ");

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <polyline points={coords} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
