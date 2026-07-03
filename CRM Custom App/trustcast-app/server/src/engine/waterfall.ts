import type { Opportunity } from "../types.js";
import { store } from "../store.js";
import { scoreOpportunity } from "./scoring.js";

export type WaterfallCategory = "added" | "won" | "lost" | "slipped" | "resized" | "unchanged";

export interface WaterfallItem {
  opportunityId: string;
  accountName: string;
  ownerName: string;
  category: WaterfallCategory;
  amountDelta: number;
  detail: string;
}

function round(n: number): number {
  return Math.round(n);
}

function weightedValue(opp: Opportunity): number {
  if (opp.stage === "Closed Won") return opp.amount ?? 0;
  if (opp.stage === "Closed Lost") return 0;
  const score = scoreOpportunity(opp);
  return (opp.amount ?? 0) * score.winProbability;
}

export function computeWaterfall() {
  const priorById = new Map(store.priorOpportunities.map((o) => [o.id, o]));
  const currentById = new Map(store.currentOpportunities.map((o) => [o.id, o]));

  const items: WaterfallItem[] = [];

  for (const [id, current] of currentById) {
    const prior = priorById.get(id);
    const account = store.getAccount(current.accountId);
    const owner = store.getRep(current.ownerId);
    const accountName = account?.name ?? current.accountId;
    const ownerName = owner?.name ?? current.ownerId;

    if (!prior) {
      const delta = weightedValue(current);
      items.push({
        opportunityId: id,
        accountName,
        ownerName,
        category: "added",
        amountDelta: round(delta),
        detail: `New pipeline added: ${accountName} (${current.stage}).`,
      });
      continue;
    }

    if (current.stage === "Closed Won" && prior.stage !== "Closed Won") {
      items.push({
        opportunityId: id,
        accountName,
        ownerName,
        category: "won",
        amountDelta: round(current.amount ?? 0),
        detail: `${accountName} closed won.`,
      });
      continue;
    }
    if (current.stage === "Closed Lost" && prior.stage !== "Closed Lost") {
      items.push({
        opportunityId: id,
        accountName,
        ownerName,
        category: "lost",
        amountDelta: round(-weightedValue(prior)),
        detail: `${accountName} closed lost.`,
      });
      continue;
    }
    if (current.stage === "Closed Won" || current.stage === "Closed Lost") continue;

    const priorClose = prior.closeDate ? new Date(prior.closeDate).getTime() : null;
    const currentClose = current.closeDate ? new Date(current.closeDate).getTime() : null;
    const slipped = priorClose !== null && currentClose !== null && currentClose > priorClose + 3 * 86_400_000;

    const priorAmt = prior.amount ?? 0;
    const currentAmt = current.amount ?? 0;
    const resized = priorAmt > 0 && Math.abs(currentAmt - priorAmt) / priorAmt > 0.05;

    if (slipped) {
      const days = Math.round((currentClose! - priorClose!) / 86_400_000);
      items.push({
        opportunityId: id,
        accountName,
        ownerName,
        category: "slipped",
        amountDelta: round(weightedValue(current) - weightedValue(prior)),
        detail: `${accountName} close date pushed ${days} days.`,
      });
    } else if (resized) {
      const direction = currentAmt > priorAmt ? "up" : "down";
      items.push({
        opportunityId: id,
        accountName,
        ownerName,
        category: "resized",
        amountDelta: round(weightedValue(current) - weightedValue(prior)),
        detail: `${accountName} resized ${direction} from $${priorAmt.toLocaleString()} to $${currentAmt.toLocaleString()}.`,
      });
    } else {
      items.push({
        opportunityId: id,
        accountName,
        ownerName,
        category: "unchanged",
        amountDelta: 0,
        detail: "No material change.",
      });
    }
  }

  const summary = {
    added: sumBy(items, "added"),
    won: sumBy(items, "won"),
    lost: sumBy(items, "lost"),
    slipped: sumBy(items, "slipped"),
    resized: sumBy(items, "resized"),
  };

  const netChange = round(Object.values(summary).reduce((a, b) => a + b, 0));

  return {
    items: items.filter((i) => i.category !== "unchanged"),
    summary,
    netChange,
    narrative: buildNarrative(items, summary),
  };
}

function sumBy(items: WaterfallItem[], category: WaterfallCategory): number {
  return Math.round(items.filter((i) => i.category === category).reduce((a, i) => a + i.amountDelta, 0));
}

function buildNarrative(items: WaterfallItem[], summary: Record<string, number>): string {
  const parts: string[] = [];
  const byCategory = (c: WaterfallCategory) => items.filter((i) => i.category === c);

  const won = byCategory("won");
  const lost = byCategory("lost");
  const slipped = byCategory("slipped");
  const resized = byCategory("resized");
  const added = byCategory("added");

  if (won.length) parts.push(`${won.length} deal${won.length > 1 ? "s" : ""} won (+$${summary.won.toLocaleString()})`);
  if (lost.length) parts.push(`${lost.length} deal${lost.length > 1 ? "s" : ""} lost ($${summary.lost.toLocaleString()})`);
  if (slipped.length) parts.push(`${slipped.length} deal${slipped.length > 1 ? "s" : ""} slipped ($${summary.slipped.toLocaleString()})`);
  if (resized.length) parts.push(`${resized.length} deal${resized.length > 1 ? "s" : ""} resized ($${summary.resized.toLocaleString()})`);
  if (added.length) parts.push(`${added.length} new deal${added.length > 1 ? "s" : ""} added (+$${summary.added.toLocaleString()})`);

  if (!parts.length) return "No material change since last period.";
  return parts.join(", ") + ".";
}
