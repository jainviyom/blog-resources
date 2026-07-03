import { store } from "../store.js";

export interface RepBias {
  repId: string;
  repName: string;
  avgOverrideDelta: number;
  avgOutcomeDelta: number;
  avgError: number;
  label: "chronic-over-caller" | "chronic-under-caller" | "well-calibrated";
}

export function computeOverrideBias(): RepBias[] {
  const byRep = new Map<string, { overrideSum: number; outcomeSum: number; count: number }>();

  for (const rec of store.overrideOutcomes) {
    const entry = byRep.get(rec.repId) ?? { overrideSum: 0, outcomeSum: 0, count: 0 };
    entry.overrideSum += rec.overrideDelta;
    entry.outcomeSum += rec.outcomeDelta;
    entry.count += 1;
    byRep.set(rec.repId, entry);
  }

  const results: RepBias[] = [];
  for (const [repId, entry] of byRep) {
    const avgOverrideDelta = entry.overrideSum / entry.count;
    const avgOutcomeDelta = entry.outcomeSum / entry.count;
    const avgError = avgOverrideDelta - avgOutcomeDelta;

    let label: RepBias["label"] = "well-calibrated";
    if (avgOverrideDelta > 3000 && avgError > 5000) label = "chronic-over-caller";
    else if (avgOverrideDelta < -3000 && avgError < -5000) label = "chronic-under-caller";

    results.push({
      repId,
      repName: store.getRep(repId)?.name ?? repId,
      avgOverrideDelta: Math.round(avgOverrideDelta),
      avgOutcomeDelta: Math.round(avgOutcomeDelta),
      avgError: Math.round(avgError),
      label,
    });
  }

  return results.sort((a, b) => Math.abs(b.avgError) - Math.abs(a.avgError));
}
