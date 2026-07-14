export default function Donut({
  percent,
  color,
  size = 96,
  thickness = 10,
  centerLabel,
}: {
  percent: number;
  color: string;
  size?: number;
  thickness?: number;
  centerLabel: string;
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  const r = (size - thickness) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - clamped / 100);
  const cx = size / 2;
  const cy = size / 2;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" strokeWidth={thickness} />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={thickness}
        strokeLinecap="round"
        strokeDasharray={circ.toFixed(2)}
        strokeDashoffset={offset.toFixed(2)}
        transform={`rotate(-90 ${cx} ${cy})`}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="Space Grotesk"
        fontWeight={700}
        fontSize={Math.round(size * 0.2)}
        fill="var(--text)"
      >
        {centerLabel}
      </text>
    </svg>
  );
}
