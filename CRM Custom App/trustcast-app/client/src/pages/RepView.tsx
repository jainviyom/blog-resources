import { useEffect, useState } from "react";
import { api } from "../api";
import type { Forecast, Opportunity } from "../api/types";
import { ConfidenceRangeBar } from "../components/ConfidenceRangeBar";
import { DealTable } from "../components/DealTable";
import { OverrideModal } from "../components/OverrideModal";

export function RepView({ repId }: { repId: string }) {
  const [deals, setDeals] = useState<Opportunity[]>([]);
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [adjusting, setAdjusting] = useState<Opportunity | null>(null);
  const [savedNote, setSavedNote] = useState<string | null>(null);

  async function load() {
    const [d, f] = await Promise.all([api.getOpportunities(repId), api.getForecast()]);
    setDeals(d);
    setForecast(f);
  }

  useEffect(() => {
    setSavedNote(null);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repId]);

  const repName = deals[0]?.ownerName;
  const bucket = forecast?.byRep.find((b) => b.key === repName);
  const openDeals = deals.filter((d) => d.stage !== "Closed Won" && d.stage !== "Closed Lost");
  const atRisk = openDeals.filter((d) => d.score.slipRisk !== "low" || d.score.flags.length > 0);

  async function submitOverride(newValue: number, reason: string) {
    if (!adjusting) return;
    await api.addOverride({
      opportunityId: adjusting.id,
      scope: "deal",
      authorId: repId,
      authorName: repName ?? repId,
      reason,
      priorValue: adjusting.amount ?? 0,
      newValue,
    });
    setSavedNote(`Override saved for ${adjusting.accountName} — reason captured for the judgment-learning loop.`);
    setAdjusting(null);
    load();
  }

  if (!deals.length) return <p className="muted">Loading…</p>;

  return (
    <div>
      <h1 style={{ fontSize: 20, marginBottom: 4 }}>My Forecast — {repName}</h1>
      <p className="secondary" style={{ marginTop: 0 }}>
        The AI drafts your forecast; you only adjust the exceptions.
      </p>

      {atRisk.length > 0 && (
        <div className="banner">
          {atRisk.length} deal{atRisk.length > 1 ? "s" : ""} flagged for attention before your next 1:1 — check slip
          risk and hygiene flags below.
        </div>
      )}

      {savedNote && (
        <div
          className="banner"
          style={{
            background: "color-mix(in srgb, var(--status-good) 14%, var(--surface-1))",
            borderColor: "color-mix(in srgb, var(--status-good) 30%, transparent)",
          }}
        >
          {savedNote}
        </div>
      )}

      <div className="grid grid-2" style={{ marginBottom: 16 }}>
        <div className="card">
          <h2>AI-Drafted Forecast (this quarter)</h2>
          {bucket ? (
            <ConfidenceRangeBar best={bucket.best} likely={bucket.likely} worst={bucket.worst} />
          ) : (
            <p className="muted">No open pipeline.</p>
          )}
          <p className="simulated-tag">Rule-based simulated scoring — hover any row for the "why".</p>
        </div>
        <div className="card">
          <h2>My Open Pipeline</h2>
          <p className="hero-figure">{openDeals.length}</p>
          <p className="hero-sub">open deals across {new Set(deals.map((d) => d.product)).size} products</p>
        </div>
      </div>

      <div className="card">
        <h2>My Deals</h2>
        <DealTable deals={deals} onAdjust={setAdjusting} />
      </div>

      {adjusting && (
        <OverrideModal
          title={`Adjust ${adjusting.accountName}`}
          priorValue={adjusting.amount ?? 0}
          onCancel={() => setAdjusting(null)}
          onSubmit={submitOverride}
        />
      )}
    </div>
  );
}
