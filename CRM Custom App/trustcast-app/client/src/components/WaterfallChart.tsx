import { money } from "../format";

interface Props {
  summary: Record<string, number>;
}

const ORDER: { key: string; label: string }[] = [
  { key: "won", label: "Won" },
  { key: "lost", label: "Lost" },
  { key: "slipped", label: "Slipped" },
  { key: "resized", label: "Resized" },
  { key: "added", label: "Added" },
];

export function WaterfallChart({ summary }: Props) {
  const max = Math.max(1, ...Object.values(summary).map((v) => Math.abs(v)));

  return (
    <div>
      <div className="legend">
        <span className="legend-item">
          <span className="legend-swatch" style={{ background: "var(--series-1)" }} />
          Increase
        </span>
        <span className="legend-item">
          <span className="legend-swatch" style={{ background: "var(--series-6)" }} />
          Decrease
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {ORDER.map(({ key, label }) => {
          const v = summary[key] ?? 0;
          const widthPct = (Math.abs(v) / max) * 48;
          const positive = v >= 0;
          return (
            <div
              key={key}
              style={{ display: "grid", gridTemplateColumns: "80px 1fr 84px", alignItems: "center", gap: 8 }}
            >
              <span className="secondary" style={{ fontSize: 13 }}>
                {label}
              </span>
              <div style={{ position: "relative", height: 18, background: "var(--gridline)", borderRadius: 4 }}>
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: 0,
                    bottom: 0,
                    width: 1,
                    background: "var(--baseline)",
                  }}
                />
                {v !== 0 && (
                  <div
                    title={`${label}: ${positive ? "+" : ""}${money(v)}`}
                    style={{
                      position: "absolute",
                      top: 0,
                      bottom: 0,
                      left: positive ? "50%" : `${50 - widthPct}%`,
                      width: `${widthPct}%`,
                      background: positive ? "var(--series-1)" : "var(--series-6)",
                      borderRadius: 3,
                    }}
                  />
                )}
              </div>
              <span style={{ fontSize: 13, fontVariantNumeric: "tabular-nums", textAlign: "right" }}>
                {positive ? "+" : ""}
                {money(v)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
