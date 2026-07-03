import { store } from "../store.js";
import { scoreOpportunity } from "./scoring.js";

const HYGIENE_FLAGS = [
  "missing-amount",
  "missing-close-date",
  "no-activity-logged",
  "ghost-deal",
  "stale-close-date",
  "stalled-in-stage",
];

export interface HygieneIssue {
  opportunityId: string;
  accountName: string;
  ownerName: string;
  stage: string;
  flags: string[];
  detail: string;
}

export function computeHygiene() {
  const deals = store.currentOpportunities;
  const issues: HygieneIssue[] = [];

  for (const opp of deals) {
    const score = scoreOpportunity(opp);
    const hygieneFlags = score.flags.filter((f) => HYGIENE_FLAGS.includes(f));
    if (hygieneFlags.length) {
      issues.push({
        opportunityId: opp.id,
        accountName: store.getAccount(opp.accountId)?.name ?? opp.accountId,
        ownerName: store.getRep(opp.ownerId)?.name ?? opp.ownerId,
        stage: opp.stage,
        flags: hygieneFlags,
        detail: score.whyText,
      });
    }
  }

  const total = deals.filter((o) => o.stage !== "Closed Won" && o.stage !== "Closed Lost").length;
  const flaggedCount = issues.length;
  const hygieneScore = total === 0 ? 1 : (total - flaggedCount) / total;

  return {
    issues,
    hygieneScore: Math.round(hygieneScore * 1000) / 1000,
    totalOpen: total,
    flaggedCount,
  };
}

export type RemediationFix = "close-date" | "activity" | "amount";

const TYPICAL_AMOUNT: Record<string, number> = {
  Enterprise: 220_000,
  "Mid-Market": 85_000,
  SMB: 25_000,
};

export function remediate(opportunityId: string, fix: RemediationFix, actor: string) {
  const opp = store.getOpportunity(opportunityId);
  if (!opp) return null;

  const before = { closeDate: opp.closeDate, lastActivityAt: opp.lastActivityAt, amount: opp.amount };

  if (fix === "close-date") {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    opp.closeDate = d.toISOString().slice(0, 10);
  } else if (fix === "activity") {
    opp.lastActivityAt = new Date().toISOString().slice(0, 10);
  } else if (fix === "amount") {
    const account = store.getAccount(opp.accountId);
    opp.amount = TYPICAL_AMOUNT[account?.segment ?? "Mid-Market"] ?? 85_000;
  }

  store.addAudit(
    actor,
    "remediate",
    `Data-Quality Agent fix "${fix}" applied to ${opportunityId} (was ${JSON.stringify(before)}) — write-back to CRM simulated.`
  );
  return opp;
}
