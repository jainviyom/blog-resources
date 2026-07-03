import type { Opportunity } from "../types.js";
import { store } from "../store.js";
import { scoreOpportunity } from "./scoring.js";

export interface ScoredDeal {
  opp: Opportunity;
  score: ReturnType<typeof scoreOpportunity>;
}

export function getScoredOpenDeals(
  opportunities: Opportunity[] = store.currentOpportunities
): ScoredDeal[] {
  return opportunities
    .filter((o) => o.stage !== "Closed Won" && o.stage !== "Closed Lost")
    .map((opp) => ({ opp, score: scoreOpportunity(opp) }));
}

export interface ForecastBucket {
  key: string;
  best: number;
  likely: number;
  worst: number;
  dealCount: number;
}

function round(n: number): number {
  return Math.round(n);
}

function bucketFor(deals: ScoredDeal[]): Omit<ForecastBucket, "key"> {
  let best = 0,
    likely = 0,
    worst = 0;
  for (const { opp, score } of deals) {
    const amt = opp.amount ?? 0;
    likely += amt * score.winProbability;
    best += amt * Math.min(1, score.winProbability * 1.25 + 0.05);
    worst += amt * Math.max(0, score.winProbability * 0.7 - 0.05) * score.confidence;
  }
  return { best: round(best), likely: round(likely), worst: round(worst), dealCount: deals.length };
}

function groupBy(deals: ScoredDeal[], keyFn: (d: ScoredDeal) => string): Map<string, ScoredDeal[]> {
  const map = new Map<string, ScoredDeal[]>();
  for (const d of deals) {
    const k = keyFn(d);
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(d);
  }
  return map;
}

function toBuckets(map: Map<string, ScoredDeal[]>): ForecastBucket[] {
  return Array.from(map.entries())
    .map(([key, deals]) => ({ key, ...bucketFor(deals) }))
    .sort((a, b) => b.likely - a.likely);
}

export function computeForecast(opportunities: Opportunity[] = store.currentOpportunities) {
  const deals = getScoredOpenDeals(opportunities);
  const total = bucketFor(deals);

  const byRegion = toBuckets(groupBy(deals, (d) => store.getRep(d.opp.ownerId)?.region ?? "Unknown"));
  const byRep = toBuckets(groupBy(deals, (d) => store.getRep(d.opp.ownerId)?.name ?? d.opp.ownerId));
  const byProduct = toBuckets(groupBy(deals, (d) => d.opp.product));
  const byRevenueType = toBuckets(groupBy(deals, (d) => d.opp.revenueType));

  return {
    total,
    byRegion,
    byRep,
    byProduct,
    byRevenueType,
    generatedAt: new Date().toISOString(),
    modelVersion: store.modelCard.version,
  };
}
