import { Router } from "express";
import { computeWaterfall } from "../engine/waterfall.js";

export const waterfallRouter = Router();

waterfallRouter.get("/waterfall", (_req, res) => {
  res.json(computeWaterfall());
});
