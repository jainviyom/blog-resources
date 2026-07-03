import { Router } from "express";
import { computeScenario, type ScenarioInput } from "../engine/scenario.js";

export const scenarioRouter = Router();

scenarioRouter.post("/scenario", (req, res) => {
  const body = req.body ?? {};
  const input: ScenarioInput = {
    winRateDeltaPct: Number(body.winRateDeltaPct) || 0,
    closeDatePullInDays: Number(body.closeDatePullInDays) || 0,
    addedPipelineAmount: Number(body.addedPipelineAmount) || 0,
  };
  res.json(computeScenario(input));
});
