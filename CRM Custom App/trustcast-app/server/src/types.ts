export type Stage =
  | "Prospecting"
  | "Qualification"
  | "Proposal"
  | "Negotiation"
  | "Committed"
  | "Closed Won"
  | "Closed Lost";

export type RevenueType = "New" | "Expansion" | "Renewal";

export type Region = "AMER" | "EMEA";

export type Product = "Core Platform" | "Analytics Add-on";

export interface Rep {
  id: string;
  name: string;
  region: Region;
  quota: number;
}

export interface Account {
  id: string;
  name: string;
  segment: "Enterprise" | "Mid-Market" | "SMB";
}

export interface Opportunity {
  id: string;
  accountId: string;
  ownerId: string;
  product: Product;
  revenueType: RevenueType;
  stage: Stage;
  amount: number | null;
  closeDate: string | null;
  createdAt: string;
  stageEnteredAt: string;
  lastActivityAt: string | null;
}

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

export interface AccuracyRecord {
  quarter: string;
  segment: string;
  forecast: number;
  actual: number;
}

export interface OverrideOutcome {
  repId: string;
  quarter: string;
  overrideDelta: number;
  outcomeDelta: number;
}
