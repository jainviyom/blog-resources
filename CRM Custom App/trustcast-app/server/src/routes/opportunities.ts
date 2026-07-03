import { Router } from "express";
import { store } from "../store.js";
import { scoreOpportunity } from "../engine/scoring.js";

export const opportunitiesRouter = Router();

opportunitiesRouter.get("/opportunities", (req, res) => {
  const { ownerId } = req.query;
  let opps = store.currentOpportunities;
  if (typeof ownerId === "string") {
    opps = opps.filter((o) => o.ownerId === ownerId);
  }
  const withScores = opps.map((opp) => ({
    ...opp,
    accountName: store.getAccount(opp.accountId)?.name ?? opp.accountId,
    ownerName: store.getRep(opp.ownerId)?.name ?? opp.ownerId,
    score: scoreOpportunity(opp),
  }));
  res.json(withScores);
});

opportunitiesRouter.get("/reps", (_req, res) => {
  res.json(store.reps);
});

opportunitiesRouter.get("/accounts", (_req, res) => {
  res.json(store.accounts);
});
