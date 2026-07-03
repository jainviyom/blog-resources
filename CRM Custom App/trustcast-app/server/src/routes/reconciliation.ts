import { Router } from "express";
import { computeReconciliation, setTopDownTarget } from "../engine/reconciliation.js";

export const reconciliationRouter = Router();

reconciliationRouter.get("/reconciliation", (_req, res) => {
  res.json(computeReconciliation());
});

reconciliationRouter.post("/reconciliation/target", (req, res) => {
  const target = Number(req.body?.target);
  if (!Number.isFinite(target) || target <= 0) {
    res.status(400).json({ error: "invalid target" });
    return;
  }
  res.json(setTopDownTarget(target));
});
