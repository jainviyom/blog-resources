import { useEffect, useState } from "react";
import { api } from "../api";
import type { AccuracyRecord, AuditEntry, Forecast, Reconciliation } from "../api/types";
import { ConfidenceRangeBar } from "../components/ConfidenceRangeBar";
import { CalibrationChart } from "../components/CalibrationChart";
import { money, moneyFull, signedPct } from "../format";

export function CFOView() {
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [reconciliation, setReconciliation] = useState<Reconciliation | null>(null);
  const [accuracy, setAccuracy] = useState<AccuracyRecord[]>([]);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [showAudit, setShowAudit] = useState(false);
  const [targetInput, setTargetInput] = useState("");

  async function load() {
    const [f, r, a, au] = await Promise.all([
      api.getForecast(),
      api.getReconciliation(),
      api.getAccuracy(),
      api.getAudit(),
    ]);
    setForecast(f);
    setReconciliation(r);
    setAccuracy(a);
    setAudit(au);
  }

  useEffect(() => {
    load();
  }, []);

  async function saveTarget() {
    const target = Number(targetInput);
    if (!Number.isFinite(target) || target <= 0) return;
    const r = await api.setTarget(target);
    setReconciliation(r);
    setTargetInput("");
    load();
  }

  function exportForecast() {
    if (!forecast) return;
    const blob = new Blob([JSON.stringify({ forecast, reconciliation, exportedAt: new Date().toISOString() }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "trustcast-board-forecast.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!forecast || !reconciliation) return <p className="muted">Loading…</p>;

  const companyAccuracy = accuracy.filter((a) => a.segment === "Company").sort((a, b) => a.quarter.localeCompare(b.quarter));

  return (
    <div>
      <h1 style={{ fontSize: 20, marginBottom: 4 }}>Board Number — CFO View</h1>
      <p className="secondary" style={{ marginTop: 0 }}>
        One number, full lineage, reconciled top-down.
      </p>

      <div className="grid grid-2" style={{ marginBottom: 16 }}>
        <div className="card">
          <h2>This Quarter's Board-Defensible Number</h2>
          <p className="hero-figure">{money(forecast.total.likely)}</p>
          <ConfidenceRangeBar best={forecast.total.best} likely={forecast.total.likely} worst={forecast.total.worst} />
          <button className="btn" style={{ marginTop: 12 }} onClick={() => setShowAudit((s) => !s)}>
            {showAudit ? "Hide" : "View"} audit trail
          </button>
          <button className="btn" style={{ marginTop: 12, marginLeft: 8 }} onClick={exportForecast}>
            Export to FP&A (JSON)
          </button>
        </div>
        <div className="card">
          <h2>Top-Down ⇄ Bottom-Up Reconciliation</h2>
          <table>
            <tbody>
              <tr>
                <td>Top-down target</td>
                <td style={{ textAlign: "right" }}>{moneyFull(reconciliation.topDownTarget)}</td>
              </tr>
              <tr>
                <td>Bottom-up (AI rollup)</td>
                <td style={{ textAlign: "right" }}>{moneyFull(reconciliation.bottomUpForecast)}</td>
              </tr>
              <tr>
                <td>Gap</td>
                <td style={{ textAlign: "right" }}>
                  <span className={`badge ${reconciliation.reconciled ? "badge-good" : "badge-serious"}`}>
                    {moneyFull(reconciliation.gap)} ({signedPct(reconciliation.gapPct)})
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <input
              type="number"
              placeholder="Set new top-down target"
              value={targetInput}
              onChange={(e) => setTargetInput(e.target.value)}
            />
            <button className="btn btn-primary" onClick={saveTarget}>
              Save
            </button>
          </div>
          <p className="simulated-tag">Contributors: {reconciliation.contributors.map((c) => `${c.segment} ${moneyFull(c.contribution)}`).join(" · ")}</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h2>Accuracy &amp; Calibration — Company</h2>
        <CalibrationChart data={companyAccuracy} />
      </div>

      {showAudit && (
        <div className="card">
          <h2>Audit Trail</h2>
          {audit.length === 0 && <p className="muted">No overrides or remediations logged yet.</p>}
          {audit.map((entry) => (
            <div key={entry.id} className="audit-entry">
              <span className="ts">{new Date(entry.timestamp).toLocaleString()}</span> — <strong>{entry.actor}</strong>{" "}
              {entry.action}: {entry.detail}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
