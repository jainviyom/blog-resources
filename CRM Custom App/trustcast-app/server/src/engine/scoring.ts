import type { DealScore, Opportunity } from "../types.js";
import { store } from "../store.js";

const STAGE_BASE_PROBABILITY: Record<string, number> = {
  Prospecting: 0.1,
  Qualification: 0.25,
  Proposal: 0.45,
  Negotiation: 0.65,
  Committed: 0.85,
  "Closed Won": 1.0,
  "Closed Lost": 0.0,
};

const TYPICAL_STAGE_DAYS: Record<string, number> = {
  Prospecting: 14,
  Qualification: 18,
  Proposal: 14,
  Negotiation: 10,
  Committed: 7,
  "Closed Won": 0,
  "Closed Lost": 0,
};

const TYPICAL_AMOUNT: Record<string, number> = {
  Enterprise: 220_000,
  "Mid-Market": 85_000,
  SMB: 25_000,
};

function daysBetween(isoDate: string, asOf: Date): number {
  return Math.round((asOf.getTime() - new Date(isoDate).getTime()) / 86_400_000);
}

export function scoreOpportunity(opp: Opportunity, asOf: Date = new Date()): DealScore {
  const flags: string[] = [];
  let probability = STAGE_BASE_PROBABILITY[opp.stage] ?? 0.2;
  let confidence = 0.85;

  const isOpen = opp.stage !== "Closed Won" && opp.stage !== "Closed Lost";

  if (opp.amount === null) {
    flags.push("missing-amount");
    confidence -= 0.2;
  }
  if (opp.closeDate === null) {
    flags.push("missing-close-date");
    confidence -= 0.2;
  }

  if (isOpen) {
    if (opp.lastActivityAt === null) {
      flags.push("no-activity-logged");
      probability -= 0.15;
      confidence -= 0.15;
    } else {
      const idleDays = daysBetween(opp.lastActivityAt, asOf);
      if (idleDays > 21) {
        flags.push("ghost-deal");
        probability -= 0.15;
        confidence -= 0.1;
      }
    }
  }

  if (isOpen && opp.closeDate) {
    const dueDays = daysBetween(opp.closeDate, asOf);
    if (dueDays > 0) {
      flags.push("stale-close-date");
      probability -= 0.1;
      confidence -= 0.1;
    }
  }

  let slipRisk: "low" | "medium" | "high" = "low";
  const typicalDays = TYPICAL_STAGE_DAYS[opp.stage] ?? 14;
  if (isOpen && typicalDays > 0) {
    const stageDays = daysBetween(opp.stageEnteredAt, asOf);
    const ratio = stageDays / typicalDays;
    if (ratio > 2) {
      slipRisk = "high";
      flags.push("stalled-in-stage");
      probability -= 0.1;
    } else if (ratio > 1.4) {
      slipRisk = "medium";
    }
  }
  if (flags.includes("ghost-deal") || flags.includes("stale-close-date")) {
    slipRisk = slipRisk === "high" ? "high" : "medium";
  }

  const account = store.getAccount(opp.accountId);
  let amountRealism: "normal" | "high" | "low" = "normal";
  if (opp.amount !== null && account) {
    const typical = TYPICAL_AMOUNT[account.segment] ?? 100_000;
    if (opp.amount > typical * 2) {
      amountRealism = "high";
      flags.push("amount-high-vs-segment");
    } else if (opp.amount < typical * 0.4) {
      amountRealism = "low";
      flags.push("amount-low-vs-segment");
    }
  }

  probability = Math.min(1, Math.max(0, probability));
  confidence = Math.min(0.95, Math.max(0.35, confidence));

  const realisticCloseDate = (() => {
    if (!isOpen) return opp.closeDate;
    if (flags.includes("stalled-in-stage") || flags.includes("stale-close-date")) {
      const base = opp.closeDate ? new Date(opp.closeDate) : new Date(asOf);
      const pushed = new Date(Math.max(base.getTime(), asOf.getTime()));
      pushed.setDate(pushed.getDate() + 21);
      return pushed.toISOString().slice(0, 10);
    }
    return opp.closeDate;
  })();

  return {
    opportunityId: opp.id,
    winProbability: probability,
    slipRisk,
    realisticCloseDate,
    amountRealism,
    confidence,
    flags,
    whyText: buildWhyText(opp, flags, probability, slipRisk),
  };
}

function buildWhyText(
  opp: Opportunity,
  flags: string[],
  probability: number,
  slipRisk: string
): string {
  const bits: string[] = [
    `${Math.round(probability * 100)}% win probability from ${opp.stage} stage baseline`,
  ];
  if (flags.includes("ghost-deal")) bits.push("no recent activity logged (ghost-deal risk)");
  if (flags.includes("no-activity-logged")) bits.push("activity was never logged");
  if (flags.includes("stale-close-date")) bits.push("close date has already passed while still open");
  if (flags.includes("stalled-in-stage")) bits.push(`sitting in ${opp.stage} well past typical duration`);
  if (flags.includes("amount-high-vs-segment")) bits.push("deal amount is unusually large for this account segment");
  if (flags.includes("amount-low-vs-segment")) bits.push("deal amount is unusually small for this account segment");
  if (flags.includes("missing-amount")) bits.push("amount is missing");
  if (flags.includes("missing-close-date")) bits.push("close date is missing");
  if (slipRisk === "high") bits.push("flagged as HIGH slip risk");
  else if (slipRisk === "medium") bits.push("flagged as medium slip risk");
  return bits.join("; ") + ".";
}
