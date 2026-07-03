// Static-hosting variant of the API client: runs the exact same rule-based
// engine used by the Express server, entirely in the browser, against the
// same seeded in-memory store. Used when built with VITE_STATIC=true (e.g.
// the GitHub Pages deploy), since a static host can't run the Node server.
import { store } from "../engine/store";
import { scoreOpportunity } from "../engine/engine/scoring";
import { computeForecast } from "../engine/engine/forecast";
import { computeWaterfall } from "../engine/engine/waterfall";
import { computeHygiene, remediate as remediateEngine, type RemediationFix } from "../engine/engine/hygiene";
import { computeScenario } from "../engine/engine/scenario";
import { computeReconciliation, setTopDownTarget } from "../engine/engine/reconciliation";
import { computeOverrideBias } from "../engine/engine/overrideBias";
import type {
  AccuracyRecord,
  AuditEntry,
  Forecast,
  Hygiene,
  ModelCard,
  Opportunity,
  Override,
  Reconciliation,
  RepBias,
  Rep,
  ScenarioInput,
  ScenarioResult,
  Waterfall,
} from "./types";

function delay<T>(value: T): Promise<T> {
  // Keep the same async shape as the real fetch-based client so components
  // don't need to know which mode they're running in.
  return Promise.resolve(value);
}

function withScore(opp: (typeof store.currentOpportunities)[number]): Opportunity {
  return {
    ...opp,
    accountName: store.getAccount(opp.accountId)?.name ?? opp.accountId,
    ownerName: store.getRep(opp.ownerId)?.name ?? opp.ownerId,
    score: scoreOpportunity(opp),
  } as unknown as Opportunity;
}

export const localApi = {
  getOpportunities: (ownerId?: string) => {
    let opps = store.currentOpportunities;
    if (ownerId) opps = opps.filter((o) => o.ownerId === ownerId);
    return delay(opps.map(withScore));
  },
  getReps: () => delay(store.reps as unknown as Rep[]),
  getForecast: () => delay(computeForecast() as unknown as Forecast),
  getWaterfall: () => delay(computeWaterfall() as unknown as Waterfall),
  getHygiene: () => delay(computeHygiene() as unknown as Hygiene),
  remediate: (id: string, fix: "close-date" | "activity" | "amount", actor: string) => {
    const opp = remediateEngine(id, fix as RemediationFix, actor);
    if (!opp) return Promise.reject(new Error("not found"));
    return delay(withScore(opp));
  },
  getOverrides: () => delay(store.overrides as unknown as Override[]),
  addOverride: (payload: {
    opportunityId: string | null;
    scope: "deal" | "rollup";
    authorId: string;
    authorName: string;
    reason: string;
    priorValue: number;
    newValue: number;
  }) => {
    if (!payload.reason?.trim()) return Promise.reject(new Error("reason is required"));
    const override = store.addOverride(payload);
    store.addAudit(
      override.authorName,
      "override",
      `${override.scope === "rollup" ? "Rollup" : "Deal " + override.opportunityId} overridden from $${override.priorValue.toLocaleString()} to $${override.newValue.toLocaleString()} — reason: ${override.reason}`
    );
    return delay(override as unknown as Override);
  },
  getAudit: () => delay(store.auditLog as unknown as AuditEntry[]),
  getReconciliation: () => delay(computeReconciliation() as unknown as Reconciliation),
  setTarget: (target: number) => {
    if (!Number.isFinite(target) || target <= 0) return Promise.reject(new Error("invalid target"));
    return delay(setTopDownTarget(target) as unknown as Reconciliation);
  },
  getAccuracy: () => delay(store.accuracyRecords as unknown as AccuracyRecord[]),
  getOverrideBias: () => delay(computeOverrideBias() as unknown as RepBias[]),
  getModelCard: () => delay(store.modelCard as unknown as ModelCard),
  runScenario: (input: ScenarioInput) => delay(computeScenario(input) as unknown as ScenarioResult),
};
