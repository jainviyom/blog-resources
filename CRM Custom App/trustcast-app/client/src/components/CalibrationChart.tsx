import { moneyFull } from "../format";

interface Point {
  quarter: string;
  forecast: number;
  actual: number;
}

export function CalibrationChart({ data }: { data: Point[] }) {
  const width = 480;
  const height = 190;
  const padding = 36;

  if (data.length < 2) return <p className="muted">Not enough history yet.</p>;

  const maxVal = Math.max(...data.flatMap((d) => [d.forecast, d.actual])) * 1.1;
  const x = (i: number) => padding + (i / (data.length - 1)) * (width - padding * 2);
  const y = (v: number) => height - padding - (v / maxVal) * (height - padding * 2);

  const linePath = (key: "forecast" | "actual") =>
    data.map((d, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(d[key])}`).join(" ");

  return (
    <div>
      <div className="legend">
        <span className="legend-item">
          <span className="legend-swatch" style={{ background: "var(--series-1)" }} />
          Forecast
        </span>
        <span className="legend-item">
          <span className="legend-swatch" style={{ background: "var(--series-2)" }} />
          Actual
        </span>
      </div>
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Forecast vs actual by quarter">
        {[0, 0.5, 1].map((f) => (
          <line
            key={f}
            x1={padding}
            x2={width - padding}
            y1={height - padding - f * (height - padding * 2)}
            y2={height - padding - f * (height - padding * 2)}
            stroke="var(--gridline)"
            strokeWidth={1}
          />
        ))}
        <path d={linePath("forecast")} fill="none" stroke="var(--series-1)" strokeWidth={2} />
        <path d={linePath("actual")} fill="none" stroke="var(--series-2)" strokeWidth={2} />
        {data.map((d, i) => (
          <g key={d.quarter}>
            <circle cx={x(i)} cy={y(d.forecast)} r={4} fill="var(--series-1)">
              <title>{`${d.quarter} forecast: ${moneyFull(d.forecast)}`}</title>
            </circle>
            <circle cx={x(i)} cy={y(d.actual)} r={4} fill="var(--series-2)">
              <title>{`${d.quarter} actual: ${moneyFull(d.actual)}`}</title>
            </circle>
            <text x={x(i)} y={height - 10} fontSize={10} textAnchor="middle" fill="var(--text-muted)">
              {d.quarter}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
