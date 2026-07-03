import type {
  Account,
  AccuracyRecord,
  Opportunity,
  OverrideOutcome,
  Product,
  Rep,
  RevenueType,
  Stage,
} from "../types.js";

const today = new Date();
function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}
function daysAgo(n: number): string {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return iso(d);
}
function daysFromNow(n: number): string {
  return daysAgo(-n);
}

export const reps: Rep[] = [
  { id: "rep-ava", name: "Ava Chen", region: "AMER", quota: 900_000 },
  { id: "rep-marcus", name: "Marcus Reyes", region: "AMER", quota: 850_000 },
  { id: "rep-priya", name: "Priya Nair", region: "EMEA", quota: 800_000 },
  { id: "rep-tom", name: "Tom Becker", region: "EMEA", quota: 750_000 },
];

export const accounts: Account[] = [
  { id: "acc-globex", name: "Globex Corp", segment: "Enterprise" },
  { id: "acc-initech", name: "Initech", segment: "Mid-Market" },
  { id: "acc-umbrella", name: "Umbrella Retail", segment: "Mid-Market" },
  { id: "acc-stark", name: "Stark Industries", segment: "Enterprise" },
  { id: "acc-wayne", name: "Wayne Manufacturing", segment: "Enterprise" },
  { id: "acc-wonka", name: "Wonka Foods", segment: "SMB" },
  { id: "acc-hooli", name: "Hooli Systems", segment: "Mid-Market" },
  { id: "acc-piedpiper", name: "Pied Piper", segment: "SMB" },
  { id: "acc-aperture", name: "Aperture Labs", segment: "Enterprise" },
  { id: "acc-tyrell", name: "Tyrell Corp", segment: "Enterprise" },
  { id: "acc-weyland", name: "Weyland-Yutani", segment: "Mid-Market" },
  { id: "acc-cyberdyne", name: "Cyberdyne EU", segment: "SMB" },
  { id: "acc-massive", name: "Massive Dynamic", segment: "Mid-Market" },
  { id: "acc-oscorp", name: "Oscorp", segment: "Enterprise" },
  { id: "acc-gringotts", name: "Gringotts Bank", segment: "Enterprise" },
  { id: "acc-soylent", name: "Soylent Europe", segment: "SMB" },
];

interface OppSpec {
  id: string;
  accountId: string;
  ownerId: string;
  product: Product;
  revenueType: RevenueType;
  stage: Stage;
  amount: number | null;
  closeDateOffset: number | null; // days from today, null = missing
  createdDaysAgo: number;
  stageEnteredDaysAgo: number;
  lastActivityDaysAgo: number | null; // null = missing (never logged)
}

// Prior-week snapshot: hand-authored pipeline with deliberate hygiene issues,
// stall/slip candidates, and amount-realism outliers baked in for the demo.
const priorSpecs: OppSpec[] = [
  // --- Ava Chen (AMER) — clean, well-run book ---
  { id: "opp-001", accountId: "acc-globex", ownerId: "rep-ava", product: "Core Platform", revenueType: "New", stage: "Prospecting", amount: 210_000, closeDateOffset: 75, createdDaysAgo: 20, stageEnteredDaysAgo: 8, lastActivityDaysAgo: 2 },
  { id: "opp-002", accountId: "acc-initech", ownerId: "rep-ava", product: "Analytics Add-on", revenueType: "Expansion", stage: "Prospecting", amount: 68_000, closeDateOffset: 60, createdDaysAgo: 15, stageEnteredDaysAgo: 5, lastActivityDaysAgo: 1 },
  { id: "opp-003", accountId: "acc-umbrella", ownerId: "rep-ava", product: "Core Platform", revenueType: "Renewal", stage: "Qualification", amount: 92_000, closeDateOffset: 45, createdDaysAgo: 40, stageEnteredDaysAgo: 12, lastActivityDaysAgo: 3 },
  { id: "opp-004", accountId: "acc-stark", ownerId: "rep-ava", product: "Core Platform", revenueType: "New", stage: "Qualification", amount: 240_000, closeDateOffset: 50, createdDaysAgo: 35, stageEnteredDaysAgo: 10, lastActivityDaysAgo: 4 },
  { id: "opp-005", accountId: "acc-globex", ownerId: "rep-ava", product: "Analytics Add-on", revenueType: "Expansion", stage: "Proposal", amount: 88_000, closeDateOffset: 25, createdDaysAgo: 50, stageEnteredDaysAgo: 9, lastActivityDaysAgo: 2 },
  { id: "opp-006", accountId: "acc-stark", ownerId: "rep-ava", product: "Core Platform", revenueType: "New", stage: "Proposal", amount: 205_000, closeDateOffset: 20, createdDaysAgo: 55, stageEnteredDaysAgo: 11, lastActivityDaysAgo: 5 },
  { id: "opp-007", accountId: "acc-initech", ownerId: "rep-ava", product: "Core Platform", revenueType: "Renewal", stage: "Negotiation", amount: 101_000, closeDateOffset: 12, createdDaysAgo: 70, stageEnteredDaysAgo: 6, lastActivityDaysAgo: 1 },
  { id: "opp-008", accountId: "acc-umbrella", ownerId: "rep-ava", product: "Analytics Add-on", revenueType: "Expansion", stage: "Committed", amount: 75_000, closeDateOffset: 9, createdDaysAgo: 80, stageEnteredDaysAgo: 4, lastActivityDaysAgo: 1 },
  { id: "opp-009", accountId: "acc-stark", ownerId: "rep-ava", product: "Core Platform", revenueType: "New", stage: "Committed", amount: 260_000, closeDateOffset: 7, createdDaysAgo: 90, stageEnteredDaysAgo: 3, lastActivityDaysAgo: 1 },

  // --- Marcus Reyes (AMER) — messy book: ghost deals, stale dates, chronic over-caller ---
  { id: "opp-010", accountId: "acc-wayne", ownerId: "rep-marcus", product: "Core Platform", revenueType: "New", stage: "Prospecting", amount: 195_000, closeDateOffset: 70, createdDaysAgo: 18, stageEnteredDaysAgo: 6, lastActivityDaysAgo: 35 },
  { id: "opp-011", accountId: "acc-wonka", ownerId: "rep-marcus", product: "Analytics Add-on", revenueType: "New", stage: "Prospecting", amount: null, closeDateOffset: 55, createdDaysAgo: 12, stageEnteredDaysAgo: 4, lastActivityDaysAgo: 6 },
  { id: "opp-012", accountId: "acc-hooli", ownerId: "rep-marcus", product: "Core Platform", revenueType: "Expansion", stage: "Qualification", amount: 85_000, closeDateOffset: 40, createdDaysAgo: 45, stageEnteredDaysAgo: 42, lastActivityDaysAgo: 3 },
  { id: "opp-013", accountId: "acc-piedpiper", ownerId: "rep-marcus", product: "Analytics Add-on", revenueType: "New", stage: "Qualification", amount: 22_000, closeDateOffset: 38, createdDaysAgo: 30, stageEnteredDaysAgo: 10, lastActivityDaysAgo: 2 },
  { id: "opp-014", accountId: "acc-wayne", ownerId: "rep-marcus", product: "Core Platform", revenueType: "New", stage: "Proposal", amount: 300_000, closeDateOffset: -3, createdDaysAgo: 60, stageEnteredDaysAgo: 15, lastActivityDaysAgo: 4 },
  { id: "opp-015", accountId: "acc-hooli", ownerId: "rep-marcus", product: "Analytics Add-on", revenueType: "Expansion", stage: "Proposal", amount: 91_000, closeDateOffset: 18, createdDaysAgo: 48, stageEnteredDaysAgo: 8, lastActivityDaysAgo: 2 },
  { id: "opp-016", accountId: "acc-wonka", ownerId: "rep-marcus", product: "Core Platform", revenueType: "Renewal", stage: "Negotiation", amount: 28_000, closeDateOffset: 14, createdDaysAgo: 65, stageEnteredDaysAgo: 7, lastActivityDaysAgo: null },
  { id: "opp-017", accountId: "acc-piedpiper", ownerId: "rep-marcus", product: "Core Platform", revenueType: "New", stage: "Committed", amount: 31_000, closeDateOffset: 8, createdDaysAgo: 75, stageEnteredDaysAgo: 5, lastActivityDaysAgo: 2 },
  { id: "opp-018", accountId: "acc-wayne", ownerId: "rep-marcus", product: "Analytics Add-on", revenueType: "Expansion", stage: "Committed", amount: 110_000, closeDateOffset: 6, createdDaysAgo: 85, stageEnteredDaysAgo: 4, lastActivityDaysAgo: 1 },
  { id: "opp-019", accountId: "acc-hooli", ownerId: "rep-marcus", product: "Core Platform", revenueType: "Renewal", stage: "Prospecting", amount: 78_000, closeDateOffset: null, createdDaysAgo: 10, stageEnteredDaysAgo: 3, lastActivityDaysAgo: 8 },

  // --- Priya Nair (EMEA) — strong, well-calibrated book ---
  { id: "opp-020", accountId: "acc-aperture", ownerId: "rep-priya", product: "Core Platform", revenueType: "New", stage: "Prospecting", amount: 220_000, closeDateOffset: 72, createdDaysAgo: 22, stageEnteredDaysAgo: 9, lastActivityDaysAgo: 2 },
  { id: "opp-021", accountId: "acc-tyrell", ownerId: "rep-priya", product: "Analytics Add-on", revenueType: "Expansion", stage: "Prospecting", amount: 95_000, closeDateOffset: 58, createdDaysAgo: 16, stageEnteredDaysAgo: 6, lastActivityDaysAgo: 3 },
  { id: "opp-022", accountId: "acc-weyland", ownerId: "rep-priya", product: "Core Platform", revenueType: "Renewal", stage: "Qualification", amount: 88_000, closeDateOffset: 44, createdDaysAgo: 38, stageEnteredDaysAgo: 14, lastActivityDaysAgo: 2 },
  { id: "opp-023", accountId: "acc-cyberdyne", ownerId: "rep-priya", product: "Analytics Add-on", revenueType: "New", stage: "Qualification", amount: 26_000, closeDateOffset: 41, createdDaysAgo: 33, stageEnteredDaysAgo: 11, lastActivityDaysAgo: 1 },
  { id: "opp-024", accountId: "acc-aperture", ownerId: "rep-priya", product: "Core Platform", revenueType: "Expansion", stage: "Proposal", amount: 198_000, closeDateOffset: 27, createdDaysAgo: 52, stageEnteredDaysAgo: 10, lastActivityDaysAgo: 2 },
  { id: "opp-025", accountId: "acc-tyrell", ownerId: "rep-priya", product: "Core Platform", revenueType: "New", stage: "Proposal", amount: 231_000, closeDateOffset: 22, createdDaysAgo: 57, stageEnteredDaysAgo: 12, lastActivityDaysAgo: 3 },
  { id: "opp-026", accountId: "acc-weyland", ownerId: "rep-priya", product: "Analytics Add-on", revenueType: "Expansion", stage: "Negotiation", amount: 99_000, closeDateOffset: 15, createdDaysAgo: 66, stageEnteredDaysAgo: 8, lastActivityDaysAgo: 1 },
  { id: "opp-027", accountId: "acc-aperture", ownerId: "rep-priya", product: "Core Platform", revenueType: "New", stage: "Committed", amount: 245_000, closeDateOffset: 10, createdDaysAgo: 88, stageEnteredDaysAgo: 5, lastActivityDaysAgo: 1 },
  { id: "opp-028", accountId: "acc-tyrell", ownerId: "rep-priya", product: "Analytics Add-on", revenueType: "Renewal", stage: "Committed", amount: 210_000, closeDateOffset: 8, createdDaysAgo: 92, stageEnteredDaysAgo: 4, lastActivityDaysAgo: 1 },

  // --- Tom Becker (EMEA) — sandbagger: chronic under-caller, one stale/ghost deal ---
  { id: "opp-029", accountId: "acc-massive", ownerId: "rep-tom", product: "Core Platform", revenueType: "New", stage: "Prospecting", amount: 82_000, closeDateOffset: 68, createdDaysAgo: 19, stageEnteredDaysAgo: 7, lastActivityDaysAgo: 4 },
  { id: "opp-030", accountId: "acc-oscorp", ownerId: "rep-tom", product: "Analytics Add-on", revenueType: "Expansion", stage: "Prospecting", amount: 205_000, closeDateOffset: 62, createdDaysAgo: 14, stageEnteredDaysAgo: 5, lastActivityDaysAgo: 3 },
  { id: "opp-031", accountId: "acc-gringotts", ownerId: "rep-tom", product: "Core Platform", revenueType: "Renewal", stage: "Qualification", amount: 190_000, closeDateOffset: -6, createdDaysAgo: 41, stageEnteredDaysAgo: 46, lastActivityDaysAgo: 33 },
  { id: "opp-032", accountId: "acc-soylent", ownerId: "rep-tom", product: "Analytics Add-on", revenueType: "New", stage: "Qualification", amount: 18_000, closeDateOffset: 36, createdDaysAgo: 28, stageEnteredDaysAgo: 9, lastActivityDaysAgo: 2 },
  { id: "opp-033", accountId: "acc-massive", ownerId: "rep-tom", product: "Core Platform", revenueType: "Expansion", stage: "Proposal", amount: 84_000, closeDateOffset: 24, createdDaysAgo: 47, stageEnteredDaysAgo: 8, lastActivityDaysAgo: 2 },
  { id: "opp-034", accountId: "acc-oscorp", ownerId: "rep-tom", product: "Core Platform", revenueType: "New", stage: "Proposal", amount: 215_000, closeDateOffset: 19, createdDaysAgo: 51, stageEnteredDaysAgo: 9, lastActivityDaysAgo: 3 },
  { id: "opp-035", accountId: "acc-gringotts", ownerId: "rep-tom", product: "Analytics Add-on", revenueType: "Renewal", stage: "Negotiation", amount: 175_000, closeDateOffset: 13, createdDaysAgo: 62, stageEnteredDaysAgo: 6, lastActivityDaysAgo: 2 },
  { id: "opp-036", accountId: "acc-soylent", ownerId: "rep-tom", product: "Core Platform", revenueType: "New", stage: "Committed", amount: 33_000, closeDateOffset: 9, createdDaysAgo: 78, stageEnteredDaysAgo: 4, lastActivityDaysAgo: 1 },
];

function specToOpp(spec: OppSpec): Opportunity {
  return {
    id: spec.id,
    accountId: spec.accountId,
    ownerId: spec.ownerId,
    product: spec.product,
    revenueType: spec.revenueType,
    stage: spec.stage,
    amount: spec.amount,
    closeDate: spec.closeDateOffset === null ? null : daysFromNow(spec.closeDateOffset),
    createdAt: daysAgo(spec.createdDaysAgo),
    stageEnteredAt: daysAgo(spec.stageEnteredDaysAgo),
    lastActivityAt: spec.lastActivityDaysAgo === null ? null : daysAgo(spec.lastActivityDaysAgo),
  };
}

export const priorOpportunities: Opportunity[] = priorSpecs.map(specToOpp);

// Current-week snapshot: prior state plus a scripted set of changes so the
// Forecast Waterfall has a rich, explainable story (won / lost / slipped /
// resized / added).
function clone(opp: Opportunity): Opportunity {
  return { ...opp };
}

export function buildCurrentOpportunities(): Opportunity[] {
  const byId = new Map(priorOpportunities.map((o) => [o.id, clone(o)]));

  // Won
  const won = byId.get("opp-007")!;
  won.stage = "Closed Won";
  won.lastActivityAt = daysAgo(0);

  const won2 = byId.get("opp-026")!;
  won2.stage = "Closed Won";
  won2.lastActivityAt = daysAgo(0);

  // Lost
  const lost = byId.get("opp-014")!;
  lost.stage = "Closed Lost";
  lost.lastActivityAt = daysAgo(1);

  // Slipped (close date pushed later, still open)
  const slip1 = byId.get("opp-012")!;
  slip1.closeDate = daysFromNow(70); // was +40 from creation baseline; pushed further out
  slip1.stageEnteredAt = daysAgo(42); // still stalled

  const slip2 = byId.get("opp-033")!;
  slip2.closeDate = daysFromNow(45); // was +24

  const slip3 = byId.get("opp-004")!;
  slip3.closeDate = daysFromNow(65); // was +50

  // Resized
  const resize1 = byId.get("opp-025")!;
  resize1.amount = 178_000; // down from 231,000

  const resize2 = byId.get("opp-021")!;
  resize2.amount = 132_000; // up from 95,000 (expansion grew)

  // Added — brand new pipeline created this week (present only in current)
  const added1: Opportunity = {
    id: "opp-040",
    accountId: "acc-umbrella",
    ownerId: "rep-ava",
    product: "Core Platform",
    revenueType: "New",
    stage: "Prospecting",
    amount: 145_000,
    closeDate: daysFromNow(80),
    createdAt: daysAgo(1),
    stageEnteredAt: daysAgo(1),
    lastActivityAt: daysAgo(0),
  };
  const added2: Opportunity = {
    id: "opp-041",
    accountId: "acc-cyberdyne",
    ownerId: "rep-priya",
    product: "Analytics Add-on",
    revenueType: "New",
    stage: "Qualification",
    amount: 34_000,
    closeDate: daysFromNow(48),
    createdAt: daysAgo(2),
    stageEnteredAt: daysAgo(1),
    lastActivityAt: daysAgo(0),
  };

  return [...byId.values(), added1, added2];
}

export const modelCard = {
  name: "TrustCast Ensemble Forecaster",
  version: "v0.4.1-demo",
  purpose:
    "Estimates per-deal win probability, slip risk, and amount realism to drive a probabilistic, explainable revenue forecast.",
  trainingData:
    "Demo build: rule-based heuristics over stage baseline rates, activity recency, time-in-stage, and seeded historical deal-size baselines (stands in for the ensemble deal-level ML + time-series + regression + LLM-reasoning models described in the BRD).",
  limits:
    "Cold-start segments fall back to stage-baseline priors with reduced confidence. Not trained on live CRM data in this prototype.",
  refreshCadence: "Recomputed on every request from live in-memory state (demo). Production target: continuous streaming refresh.",
  lastUpdated: daysAgo(0),
};

export const accuracyRecords: AccuracyRecord[] = [
  { quarter: "2025-Q3", segment: "Company", forecast: 3_120_000, actual: 2_980_000 },
  { quarter: "2025-Q3", segment: "AMER", forecast: 1_680_000, actual: 1_610_000 },
  { quarter: "2025-Q3", segment: "EMEA", forecast: 1_440_000, actual: 1_370_000 },

  { quarter: "2025-Q4", segment: "Company", forecast: 3_350_000, actual: 3_410_000 },
  { quarter: "2025-Q4", segment: "AMER", forecast: 1_820_000, actual: 1_760_000 },
  { quarter: "2025-Q4", segment: "EMEA", forecast: 1_530_000, actual: 1_650_000 },

  { quarter: "2026-Q1", segment: "Company", forecast: 3_260_000, actual: 3_190_000 },
  { quarter: "2026-Q1", segment: "AMER", forecast: 1_750_000, actual: 1_690_000 },
  { quarter: "2026-Q1", segment: "EMEA", forecast: 1_510_000, actual: 1_500_000 },

  { quarter: "2026-Q2", segment: "Company", forecast: 3_480_000, actual: 3_520_000 },
  { quarter: "2026-Q2", segment: "AMER", forecast: 1_860_000, actual: 1_930_000 },
  { quarter: "2026-Q2", segment: "EMEA", forecast: 1_620_000, actual: 1_590_000 },
];

// Override history with baked-in per-rep bias for the RevOps override-bias
// leaderboard: Marcus chronically over-calls (happy ears), Tom chronically
// under-calls (sandbags), Ava and Priya are well-calibrated.
export const overrideOutcomes: OverrideOutcome[] = [
  ...["2025-Q3", "2025-Q4", "2026-Q1", "2026-Q2", "2026-Q3"].flatMap((quarter, i) => [
    { repId: "rep-ava", quarter, overrideDelta: [2000, -1000, 1500, -2000, 1000][i], outcomeDelta: [1000, -1500, 2000, -1000, 500][i] },
    { repId: "rep-marcus", quarter, overrideDelta: [11000, 9000, 14000, 8000, 12000][i], outcomeDelta: [-3000, -5000, -2000, -8000, -4000][i] },
    { repId: "rep-priya", quarter, overrideDelta: [5000, -6000, 7000, -4000, 3000][i], outcomeDelta: [4000, -5000, 6000, -3000, 2000][i] },
    { repId: "rep-tom", quarter, overrideDelta: [-9000, -6000, -11000, -7000, -8000][i], outcomeDelta: [5000, 4000, 6000, 5000, 7000][i] },
  ]),
];

export const initialTopDownTarget = 1_950_000;
