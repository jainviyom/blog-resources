import { Router } from "express";
import { store } from "../store.js";

export const overridesRouter = Router();

overridesRouter.get("/overrides", (_req, res) => {
  res.json(store.overrides);
});

overridesRouter.post("/overrides", (req, res) => {
  const b = req.body ?? {};
  if (!b.reason || typeof b.reason !== "string" || !b.reason.trim()) {
    res.status(400).json({ error: "reason is required" });
    return;
  }
  const override = store.addOverride({
    opportunityId: b.opportunityId ?? null,
    scope: b.scope === "rollup" ? "rollup" : "deal",
    authorId: b.authorId ?? "unknown",
    authorName: b.authorName ?? "Unknown",
    reason: b.reason,
    priorValue: Number(b.priorValue) || 0,
    newValue: Number(b.newValue) || 0,
  });
  store.addAudit(
    override.authorName,
    "override",
    `${override.scope === "rollup" ? "Rollup" : "Deal " + override.opportunityId} overridden from $${override.priorValue.toLocaleString()} to $${override.newValue.toLocaleString()} — reason: ${override.reason}`
  );
  res.status(201).json(override);
});

overridesRouter.get("/audit", (_req, res) => {
  res.json(store.auditLog);
});
