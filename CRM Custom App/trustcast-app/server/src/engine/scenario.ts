import { getScoredOpenDeals } from "./forecast.js";

export interface ScenarioInput {
  winRateDeltaPct: number;
  closeDatePullInDays: number;
  addedPipelineAmount: number;
}

export function computeScenario(input: ScenarioInput) {
  const deals = getScoredOpenDeals();
  let best = 0,
    likely = 0,
    worst = 0;

  for (const { opp, score } of deals) {
    const amt = opp.amount ?? 0;
    let prob = score.winProbability + input.winRateDeltaPct / 100;
    if (input.closeDatePullInDays > 0 && opp.closeDate) {
      prob += Math.min(0.05, input.closeDatePullInDays / 400);
    }
    prob = Math.min(1, Math.max(0, prob));
    likely += amt * prob;
    best += amt * Math.min(1, prob * 1.25 + 0.05);
    worst += amt * Math.max(0, prob * 0.7 - 0.05) * score.confidence;
  }

  if (input.addedPipelineAmount > 0) {
    likely += input.addedPipelineAmount * 0.3;
    best += input.addedPipelineAmount * 0.5;
    worst += input.addedPipelineAmount * 0.1;
  }

  return {
    best: Math.round(best),
    likely: Math.round(likely),
    worst: Math.round(worst),
    input,
  };
}
