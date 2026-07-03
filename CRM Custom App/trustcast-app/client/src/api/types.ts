export type Stage =
  | "Prospecting"
  | "Qualification"
  | "Proposal"
  | "Negotiation"
  | "Committed"
  | "Closed Won"
  | "Closed Lost";

export interface DealScore {
  opportunityId: string;
  winProbability: number;
  slipRisk: "low" | "medium" | "high";
  realisticCloseDate: string | null;
  amountRealism: "normal" | "high" | "low";
  confidence: number;
  flags: string[];
  whyText: string;
}

export interface Opportunity {
  id: string;
  accountId: string;
  accountName: string;
  ownerId: string;
  ownerName: string;
  product: string;
  revenueType: string;
  stage: Stage;
  amount: number | null;
  closeDate: string | null;
  createdAt: string;
  stageEnteredAt: string;
  lastActivityAt: string | null;
  score: DealScore;
}

export interface ForecastBucket {
  key: string;
  best: number;
  likely: number;
  worst: number;
  dealCount: number;
}

export interface Forecast {
  total: ForecastBucket;
  byRegion: ForecastBucket[];
  byRep: ForecastBucket[];
  byProduct: ForecastBucket[];
  byRevenueType: ForecastBucket[];
  generatedAt: string;
  modelVersion: string;
}

export interface WaterfallItem {
  opportunityId: string;
  accountName: string;
  ownerName: string;
  category: "added" | "won" | "lost" | "slipped" | "resized";
  amountDelta: number;
  detail: string;
}

export interface Waterfall {
  items: WaterfallItem[];
  summary: Record<string, number>;
  netChange: number;
  narrative: string;
}

export interface HygieneIssue {
  opportunityId: string;
  accountName: string;
  ownerName: string;
  stage: string;
  flags: string[];
  detail: string;
}

export interface Hygiene {
  issues: HygieneIssue[];
  hygieneScore: number;
  totalOpen: number;
  flaggedCount: number;
}

export interface Reconciliation {
  topDownTarget: number;
  bottomUpForecast: number;
  gap: number;
  gapPct: number;
  reconciled: boolean;
  contributors: { segment: string; contribution: number }[];
}

export interface AccuracyRecord {
  quarter: string;
  segment: string;
  forecast: number;
  actual: number;
}

export interface RepBias {
  repId: string;
  repName: string;
  avgOverrideDelta: number;
  avgOutcomeDelta: number;
  avgError: number;
  label: "chronic-over-caller" | "chronic-under-caller" | "well-calibrated";
}

export interface Rep {
  id: string;
  name: string;
  region: string;
  quota: number;
}

export interface Override {
  id: string;
  opportunityId: string | null;
  scope: "deal" | "rollup";
  authorId: string;
  authorName: string;
  reason: string;
  priorValue: number;
  newValue: number;
  timestamp: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  detail: string;
}

export interface ScenarioInput {
  winRateDeltaPct: number;
  closeDatePullInDays: number;
  addedPipelineAmount: number;
}

export interface ScenarioResult {
  best: number;
  likely: number;
  worst: number;
  input: ScenarioInput;
}

export interface ModelCard {
  name: string;
  version: string;
  purpose: string;
  trainingData: string;
  limits: string;
  refreshCadence: string;
  lastUpdated: string;
}
