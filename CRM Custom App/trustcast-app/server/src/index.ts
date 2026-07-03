import express from "express";
import cors from "cors";
import { opportunitiesRouter } from "./routes/opportunities.js";
import { forecastRouter } from "./routes/forecast.js";
import { waterfallRouter } from "./routes/waterfall.js";
import { scenarioRouter } from "./routes/scenario.js";
import { hygieneRouter } from "./routes/hygiene.js";
import { overridesRouter } from "./routes/overrides.js";
import { reconciliationRouter } from "./routes/reconciliation.js";
import { accuracyRouter } from "./routes/accuracy.js";

const app = express();
app.use(cors());
app.use(express.json());

const api = express.Router();
api.use(opportunitiesRouter);
api.use(forecastRouter);
api.use(waterfallRouter);
api.use(scenarioRouter);
api.use(hygieneRouter);
api.use(overridesRouter);
api.use(reconciliationRouter);
api.use(accuracyRouter);

app.use("/api", api);

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(PORT, () => {
  console.log(`TrustCast server listening on http://localhost:${PORT}`);
});
