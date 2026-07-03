import { money } from "../format";

interface Props {
  best: number;
  likely: number;
  worst: number;
}

export function ConfidenceRangeBar({ best, likely, worst }: Props) {
  const max = Math.max(best, likely, worst, 1);
  const likelyPct = (likely / max) * 100;
  const bestPct = (best / max) * 100;
  const worstPct = (worst / max) * 100;

  return (
    <div>
      <div
        style={{
          position: "relative",
          height: 28,
          background: "var(--gridline)",
          borderRadius: 6,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            width: `${bestPct}%`,
            background: "var(--seq-100)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            width: `${likelyPct}%`,
            background: "var(--seq-450)",
          }}
        />
        <div
          title={`Worst case: ${money(worst)}`}
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: `${worstPct}%`,
            width: 2,
            background: "var(--text-primary)",
          }}
        />
      </div>
      <div
        className="secondary"
        style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginTop: 6 }}
      >
        <span>Worst {money(worst)}</span>
        <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>Likely {money(likely)}</span>
        <span>Best {money(best)}</span>
      </div>
    </div>
  );
}
