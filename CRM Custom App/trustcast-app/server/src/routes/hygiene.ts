import { Router } from "express";
import { computeHygiene, remediate, type RemediationFix } from "../engine/hygiene.js";

export const hygieneRouter = Router();

hygieneRouter.get("/hygiene", (_req, res) => {
  res.json(computeHygiene());
});

hygieneRouter.post("/hygiene/:id/remediate", (req, res) => {
  const { id } = req.params;
  const fix = req.body?.fix as RemediationFix;
  const actor = req.body?.actor ?? "RevOps";
  if (!["close-date", "activity", "amount"].includes(fix)) {
    res.status(400).json({ error: "invalid fix type" });
    return;
  }
  const opp = remediate(id, fix, actor);
  if (!opp) {
    res.status(404).json({ error: "not found" });
    return;
  }
  res.json(opp);
});
