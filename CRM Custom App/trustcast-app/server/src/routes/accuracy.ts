import { Router } from "express";
import { store } from "../store.js";
import { computeOverrideBias } from "../engine/overrideBias.js";

export const accuracyRouter = Router();

accuracyRouter.get("/accuracy", (_req, res) => {
  res.json(store.accuracyRecords);
});

accuracyRouter.get("/override-bias", (_req, res) => {
  res.json(computeOverrideBias());
});

accuracyRouter.get("/model-card", (_req, res) => {
  res.json(store.modelCard);
});
