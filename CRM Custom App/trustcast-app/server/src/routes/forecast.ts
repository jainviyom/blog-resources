import { Router } from "express";
import { computeForecast } from "../engine/forecast.js";

export const forecastRouter = Router();

forecastRouter.get("/forecast", (_req, res) => {
  res.json(computeForecast());
});
