import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { Forecast, Opportunity, ScenarioResult, Waterfall } from "../api/types";
import { ConfidenceRangeBar } from "../components/ConfidenceRangeBar";
import { WaterfallChart } from "../components/WaterfallChart";
import { DealTable } from "../components/DealTable";
import { OverrideModal } from "../components/OverrideModal";
import { moneyFull } from "../format";

export function ManagerCROView() {
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [waterfall, setWaterfall] = useState<Waterfall | null>(null);
  const [deals, setDeals] = useState<Opportunity[]>([]);
  const [adjusting, setAdjusting] = useState<Opportunity | null>(null);

  const [winRateDeltaPct, setWinRateDeltaPct] = useState(0);
  const [closeDatePullInDays, setCloseDatePullInDays] = useState(0);
  const [addedPipelineAmount, setAddedPipelineAmount] = useState(0);
  const [scenario, setScenario] = useState<ScenarioResult | null>(null);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);

  async function load() {
    const [f, w, d] = await Promise.all([api.getForecast(), api.getWaterfall(), api.getOpportunities()]);
    setForecast(f);
    setWaterfall(w);
    setDeals(d);
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    api.runScenario({ winRateDeltaPct, closeDatePullInDays, addedPipelineAmount }).then(setScenario);
  }, [winRateDeltaPct, closeDatePullInDays, addedPipelineAmount]);

  const openDeals = deals.filter((d) => d.stage !== "Closed Won" && d.stage !== "Closed Lost");
  const riskRegister = [...openDeals]
    .sort((a, b) => {
      const rank = { high: 0, medium: 1, low: 2 };
      return rank[a.score.slipRisk] - rank[b.score.slipRisk] || (b.amount ?? 0) - (a.amount ?? 0);
    })
    .slice(0, 8);

  async function submitOverride(newValue: number, reason: string) {
    if (!adjusting) return;
    await api.addOverride({
      opportunityId: adjusting.id,
      scope: "deal",
      authorId: "manager",
      authorName: "Manager override",
      reason,
      priorValue: adjusting.amount ?? 0,
      newValue,
    });
    setAdjusting(null);
    load();
  }

  function handleAsk() {
    const lower = question.toLowerCase();
    if (!lower.trim()) return;
    if (lower.includes("why") || lower.includes("down") || lower.includes("waterfall") || lower.includes("change")) {
      setAnswer(waterfall?.narrative ?? "No waterfall data yet.");
      return;
    }
    const matched = deals.find((d) => lower.includes(d.accountName.toLowerCase()));
    if (matched && (lower.includes("pull") || lower.includes("what if") || lower.includes("close"))) {
      const amt = matched.amount ?? 0;
      const uplift = amt * (1 - matched.score.winProbability);
      setAnswer(
        `If ${matched.accountName} (${moneyFull(amt)}) closes now, likely forecast moves from ${moneyFull(
          forecast?.total.likely ?? 0
        )} to about ${moneyFull((forecast?.total.likely ?? 0) + uplift)}.`
      );
      return;
    }
    setAnswer(`Try: "why is the forecast down" or "what if ${deals[0]?.accountName ?? "Acme"} pulls in?"`);
  }

  if (!forecast || !waterfall) return <p className="muted">Loading…</p>;

  return (
    <div>
      <h1 style={{ fontSize: 20, marginBottom: 4 }}>Team Forecast — CRO View</h1>
      <p className="secondary" style={{ marginTop: 0 }}>
        Defend the number — know exactly what changed and why.
      </p>

      <div className="grid grid-2" style={{ marginBottom: 16 }}>
        <div className="card">
          <h2>Team Commit — This Quarter</h2>
          <ConfidenceRangeBar
            best={forecast.total.best}
            likely={forecast.total.likely}
            worst={forecast.total.worst}
          />
          <p className="simulated-tag">Model {forecast.modelVersion} · generated {new Date(forecast.generatedAt).toLocaleTimeString()}</p>
        </div>
        <div className="card">
          <h2>Forecast Waterfall</h2>
          <p style={{ fontSize: 13, marginTop: 0 }}>{waterfall.narrative}</p>
          <WaterfallChart summary={waterfall.summary} />
        </div>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 16 }}>
        <div className="card">
          <h2>Risk Register — likely to swing</h2>
          <DealTable deals={riskRegister} showOwner onAdjust={setAdjusting} />
        </div>
        <div className="card">
          <h2>Scenario Simulator</h2>
          <div className="slider-row">
            <label>
              <span>Win-rate shift</span>
              <span>
                {winRateDeltaPct > 0 ? "+" : ""}
                {winRateDeltaPct} pts
              </span>
            </label>
            <input
              type="range"
              min={-20}
              max={20}
              value={winRateDeltaPct}
              onChange={(e) => setWinRateDeltaPct(Number(e.target.value))}
            />
          </div>
          <div className="slider-row">
            <label>
              <span>Pull close dates in</span>
              <span>{closeDatePullInDays} days</span>
            </label>
            <input
              type="range"
              min={0}
              max={30}
              value={closeDatePullInDays}
              onChange={(e) => setCloseDatePullInDays(Number(e.target.value))}
            />
          </div>
          <div className="slider-row">
            <label>
              <span>Added pipeline</span>
              <span>{moneyFull(addedPipelineAmount)}</span>
            </label>
            <input
              type="range"
              min={0}
              max={500000}
              step={25000}
              value={addedPipelineAmount}
              onChange={(e) => setAddedPipelineAmount(Number(e.target.value))}
            />
          </div>
          {scenario && (
            <ConfidenceRangeBar best={scenario.best} likely={scenario.likely} worst={scenario.worst} />
          )}
          <p className="simulated-tag">Recalculates instantly against live pipeline — no batch delay.</p>
        </div>
      </div>

      <div className="card">
        <h2>Ask TrustCast</h2>
        <p className="simulated-tag" style={{ marginTop: -6 }}>
          Templated NL reasoning for this demo — production reasons over live signals via LLM.
        </p>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <input
            type="text"
            placeholder='e.g. "why is the forecast down?"'
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAsk()}
          />
          <button className="btn btn-primary" onClick={handleAsk}>
            Ask
          </button>
        </div>
        {answer && (
          <p className="card" style={{ marginTop: 12, fontSize: 13 }}>
            {answer}
          </p>
        )}
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
