import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { Hygiene, ModelCard, RepBias } from "../api/types";
import { FlagBadges } from "../components/FlagBadges";
import { pct } from "../format";

function pickFix(flags: string[]): "close-date" | "activity" | "amount" | null {
  if (flags.includes("stale-close-date") || flags.includes("missing-close-date")) return "close-date";
  if (flags.includes("ghost-deal") || flags.includes("no-activity-logged")) return "activity";
  if (flags.includes("missing-amount") || flags.includes("amount-high-vs-segment") || flags.includes("amount-low-vs-segment"))
    return "amount";
  return null;
}

const LABEL: Record<RepBias["label"], { text: string; tone: "good" | "warning" | "critical" }> = {
  "well-calibrated": { text: "Well-calibrated", tone: "good" },
  "chronic-over-caller": { text: "Chronic over-caller (happy ears)", tone: "warning" },
  "chronic-under-caller": { text: "Chronic under-caller (sandbagging)", tone: "critical" },
};

export function RevOpsView() {
  const [hygiene, setHygiene] = useState<Hygiene | null>(null);
  const [bias, setBias] = useState<RepBias[]>([]);
  const [modelCard, setModelCard] = useState<ModelCard | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    const [h, b, m] = await Promise.all([api.getHygiene(), api.getOverrideBias(), api.getModelCard()]);
    setHygiene(h);
    setBias(b);
    setModelCard(m);
  }

  useEffect(() => {
    load();
  }, []);

  async function remediate(id: string, flags: string[]) {
    const fix = pickFix(flags);
    if (!fix) return;
    setBusyId(id);
    await api.remediate(id, fix, "RevOps (Data-Quality Agent)");
    await load();
    setBusyId(null);
  }

  if (!hygiene) return <p className="muted">Loading…</p>;

  return (
    <div>
      <h1 style={{ fontSize: 20, marginBottom: 4 }}>RevOps / Admin</h1>
      <p className="secondary" style={{ marginTop: 0 }}>
        Fix hygiene at the source; track who chronically over- or under-calls.
      </p>

      <div className="grid grid-2" style={{ marginBottom: 16 }}>
        <div className="card">
          <h2>Data Hygiene Score</h2>
          <p className="hero-figure">{pct(hygiene.hygieneScore)}</p>
          <p className="hero-sub">
            {hygiene.flaggedCount} of {hygiene.totalOpen} open deals flagged
          </p>
        </div>
        <div className="card">
          <h2>Model Card</h2>
          {modelCard && (
            <table>
              <tbody>
                <tr>
                  <td>Model</td>
                  <td>{modelCard.name} ({modelCard.version})</td>
                </tr>
                <tr>
                  <td>Purpose</td>
                  <td>{modelCard.purpose}</td>
                </tr>
                <tr>
                  <td>Training data</td>
                  <td>{modelCard.trainingData}</td>
                </tr>
                <tr>
                  <td>Limits</td>
                  <td>{modelCard.limits}</td>
                </tr>
                <tr>
                  <td>Refresh cadence</td>
                  <td>{modelCard.refreshCadence}</td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h2>Data-Quality Agent Queue</h2>
        <table>
          <thead>
            <tr>
              <th>Account</th>
              <th>Owner</th>
              <th>Stage</th>
              <th>Flags</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {hygiene.issues.map((issue) => {
              const fix = pickFix(issue.flags);
              return (
                <tr key={issue.opportunityId} title={issue.detail}>
                  <td>{issue.accountName}</td>
                  <td>{issue.ownerName}</td>
                  <td>{issue.stage}</td>
                  <td>
                    <FlagBadges flags={issue.flags} />
                  </td>
                  <td>
                    {fix && (
                      <button
                        className="btn"
                        disabled={busyId === issue.opportunityId}
                        onClick={() => remediate(issue.opportunityId, issue.flags)}
                      >
                        {busyId === issue.opportunityId ? "Fixing…" : "Remediate"}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {hygiene.issues.length === 0 && (
              <tr>
                <td colSpan={5} className="muted">
                  No hygiene issues — clean pipeline.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <p className="simulated-tag">Remediate simulates a write-back to the CRM and logs it to the audit trail.</p>
      </div>

      <div className="card">
        <h2>Override-Bias Leaderboard</h2>
        <table>
          <thead>
            <tr>
              <th>Rep</th>
              <th>Avg. override delta</th>
              <th>Avg. outcome delta</th>
              <th>Reliability</th>
            </tr>
          </thead>
          <tbody>
            {bias.map((b) => (
              <tr key={b.repId}>
                <td>{b.repName}</td>
                <td>{b.avgOverrideDelta >= 0 ? "+" : ""}{b.avgOverrideDelta.toLocaleString()}</td>
                <td>{b.avgOutcomeDelta >= 0 ? "+" : ""}{b.avgOutcomeDelta.toLocaleString()}</td>
                <td>
                  <span className={`badge badge-${LABEL[b.label].tone}`}>{LABEL[b.label].text}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="simulated-tag">Fed by the judgment-learning loop: override vs. actual outcome, tracked per rep over time.</p>
      </div>
    </div>
  );
}
