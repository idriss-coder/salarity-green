import { computeBaseline, computeFuture } from "./baseline";
import { DEFAULT_HORIZON_YEARS, ENGINE_VERSION, SCENARIOS } from "./config";
import { computeRecommendation } from "./recommendation";
import { baselineCumulative, computeScenario } from "./scenarios";
import type { EngineInput, Snapshot } from "./types";

export * from "./types";
export * from "./money";
export { ENGINE_VERSION, SCENARIOS, COST_LABELS, COST_ORDER } from "./config";
export { outagesPerYear } from "./baseline";
export { formatPayback } from "./recommendation";

/**
 * Point d'entrée du moteur : entrées typées → snapshot immuable.
 * Fonction pure : mêmes entrées ⇒ même snapshot.
 */
export function computeSnapshot(input: EngineInput): Snapshot {
  const horizonYears =
    input.project.horizonYears > 0 ? input.project.horizonYears : DEFAULT_HORIZON_YEARS;
  const baseline = computeBaseline(input);
  const future = computeFuture(input);
  const scenarios = SCENARIOS.map((definition) =>
    computeScenario(definition, baseline, horizonYears),
  );
  const recommendation = computeRecommendation(scenarios, baseline, input, future);

  return {
    engineVersion: ENGINE_VERSION,
    currency: "FCFA",
    horizonYears,
    baseline,
    future,
    baselineCumulative: baselineCumulative(baseline, horizonYears),
    scenarios,
    recommendation,
  };
}
