const FLAG_META: Record<string, { label: string; tone: "warning" | "serious" | "critical" }> = {
  "missing-amount": { label: "Missing amount", tone: "critical" },
  "missing-close-date": { label: "Missing close date", tone: "critical" },
  "no-activity-logged": { label: "No activity logged", tone: "warning" },
  "ghost-deal": { label: "Ghost deal", tone: "serious" },
  "stale-close-date": { label: "Stale close date", tone: "serious" },
  "stalled-in-stage": { label: "Stalled in stage", tone: "warning" },
  "amount-high-vs-segment": { label: "Amount unusually high", tone: "warning" },
  "amount-low-vs-segment": { label: "Amount unusually low", tone: "warning" },
};

export function FlagBadges({ flags }: { flags: string[] }) {
  if (!flags.length) return <span className="badge badge-good">Clean</span>;
  return (
    <div className="flag-list">
      {flags.map((f) => {
        const meta = FLAG_META[f] ?? { label: f, tone: "warning" as const };
        return (
          <span key={f} className={`badge badge-${meta.tone}`}>
            {meta.label}
          </span>
        );
      })}
    </div>
  );
}

export function SlipRiskBadge({ risk }: { risk: "low" | "medium" | "high" }) {
  const tone = risk === "high" ? "critical" : risk === "medium" ? "warning" : "good";
  return <span className={`badge badge-${tone}`}>{risk} slip risk</span>;
}
