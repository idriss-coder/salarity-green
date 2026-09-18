import { PAYBACK_TIE_HUNDREDTHS } from "./config";
import { formatBp, formatMillions, formatNumber } from "./money";
import type { Baseline, EngineInput, FutureContext, Recommendation, ScenarioResult } from "./types";

/**
 * Sélection : délai de retour le plus court parmi les scénarios rentables ;
 * à égalité (± PAYBACK_TIE_HUNDREDTHS), l'économie annuelle la plus élevée.
 * Repli : plus forte économie annuelle si aucun scénario n'a de délai de retour.
 */
export function selectScenario(scenarios: ScenarioResult[]): ScenarioResult {
  const viable = scenarios.filter((s) => s.paybackYearsHundredths !== null);
  const pool = viable.length > 0 ? viable : scenarios;
  return pool.reduce((best, current) => {
    const bestPayback = best.paybackYearsHundredths ?? Number.POSITIVE_INFINITY;
    const currentPayback = current.paybackYearsHundredths ?? Number.POSITIVE_INFINITY;
    const delta = currentPayback - bestPayback;
    if (Math.abs(delta) <= PAYBACK_TIE_HUNDREDTHS) {
      return current.savingsPerYear > best.savingsPerYear ? current : best;
    }
    return delta < 0 ? current : best;
  });
}

export function formatPayback(hundredths: number): string {
  return `${formatNumber(hundredths / 100, 2)} ans`;
}

/** Motifs générés uniquement à partir des métriques du snapshot (jamais de texte libre chiffré). */
export function buildReasons(
  scenario: ScenarioResult,
  baseline: Baseline,
  input: EngineInput,
  future: FutureContext | undefined,
): string[] {
  const reasons: string[] = [];
  const impact = (key: string) => scenario.impacts.find((i) => i.key === key);
  const applicable = (key: string) =>
    baseline.items.find((i) => i.key === key)?.applicable ?? false;

  if (scenario.paybackYearsHundredths !== null) {
    reasons.push(`Délai de retour estimé à ${formatPayback(scenario.paybackYearsHundredths)}`);
  }
  reasons.push(
    `Économie annuelle de ${formatMillions(scenario.savingsPerYear)} (${formatBp(scenario.totalReductionBp, 0)} des coûts actuels)`,
  );

  const productionLoss = impact("productionLoss");
  if (productionLoss && productionLoss.reductionBp >= 10_000) {
    reasons.push("Suppression des arrêts de production liés aux coupures");
  } else if (productionLoss && productionLoss.reductionBp > 0) {
    reasons.push(`Réduction de ${formatBp(productionLoss.reductionBp)} des pertes de production`);
  }

  const diesel = impact("diesel");
  if (applicable("diesel") && diesel && diesel.reductionBp > 0) {
    reasons.push(`Forte diminution de la consommation de diesel (${formatBp(diesel.reductionBp)})`);
  }

  if (future) {
    reasons.push(
      `Compatible avec l'extension à ${formatNumber(future.targetRatePerHour)} ${input.production.unit}s/heure`,
    );
  }

  reasons.push(`Base solide pour la croissance de ${input.company.name}`);
  return reasons.slice(0, 6);
}

export function computeRecommendation(
  scenarios: ScenarioResult[],
  baseline: Baseline,
  input: EngineInput,
  future: FutureContext | undefined,
): Recommendation {
  const selected = selectScenario(scenarios);
  return { scenarioKey: selected.key, reasons: buildReasons(selected, baseline, input, future) };
}
