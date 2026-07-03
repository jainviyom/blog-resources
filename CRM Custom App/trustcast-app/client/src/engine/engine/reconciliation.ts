import { store } from "../store";
import { computeForecast } from "./forecast";

export function computeReconciliation() {
  const forecast = computeForecast();
  const bottomUp = forecast.total.likely;
  const target = store.topDownTarget;
  const gap = bottomUp - target;
  const gapPct = target === 0 ? 0 : gap / target;

  const contributors = forecast.byRegion
    .map((b) => ({ segment: b.key, contribution: b.likely }))
    .sort((a, b) => b.contribution - a.contribution);

  return {
    topDownTarget: target,
    bottomUpForecast: bottomUp,
    gap: Math.round(gap),
    gapPct: Math.round(gapPct * 1000) / 1000,
    reconciled: Math.abs(gapPct) < 0.02,
    contributors,
  };
}

export function setTopDownTarget(target: number) {
  store.topDownTarget = target;
  store.addAudit("CFO", "set-target", `Top-down target updated to $${target.toLocaleString()}.`);
  return computeReconciliation();
}
