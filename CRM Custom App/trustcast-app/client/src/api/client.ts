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

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`/api${path}`);
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`/api${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? `POST ${path} failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  getOpportunities: (ownerId?: string) =>
    get<Opportunity[]>(`/opportunities${ownerId ? `?ownerId=${ownerId}` : ""}`),
  getReps: () => get<Rep[]>("/reps"),
  getForecast: () => get<Forecast>("/forecast"),
  getWaterfall: () => get<Waterfall>("/waterfall"),
  getHygiene: () => get<Hygiene>("/hygiene"),
  remediate: (id: string, fix: "close-date" | "activity" | "amount", actor: string) =>
    post<Opportunity>(`/hygiene/${id}/remediate`, { fix, actor }),
  getOverrides: () => get<Override[]>("/overrides"),
  addOverride: (payload: {
    opportunityId: string | null;
    scope: "deal" | "rollup";
    authorId: string;
    authorName: string;
    reason: string;
    priorValue: number;
    newValue: number;
  }) => post<Override>("/overrides", payload),
  getAudit: () => get<AuditEntry[]>("/audit"),
  getReconciliation: () => get<Reconciliation>("/reconciliation"),
  setTarget: (target: number) => post<Reconciliation>("/reconciliation/target", { target }),
  getAccuracy: () => get<AccuracyRecord[]>("/accuracy"),
  getOverrideBias: () => get<RepBias[]>("/override-bias"),
  getModelCard: () => get<ModelCard>("/model-card"),
  runScenario: (input: ScenarioInput) => post<ScenarioResult>("/scenario", input),
};
