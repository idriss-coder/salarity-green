import { residualAmount } from "./baseline";
import { ratioBp, ratioHundredths, roundMoney, sum } from "./money";
import type { Baseline, ScenarioDefinition, ScenarioResult } from "./types";

/** Coût cumulé de la situation actuelle, années 0..N (pas d'investissement). */
export function baselineCumulative(baseline: Baseline, horizonYears: number): number[] {
  return Array.from({ length: horizonYears + 1 }, (_, year) => baseline.total * year);
}

export function computeScenario(
  definition: ScenarioDefinition,
  baseline: Baseline,
  horizonYears: number,
): ScenarioResult {
  const gridAmount = baseline.items.find((i) => i.key === "grid")?.amount ?? 0;
  const investment = roundMoney((gridAmount * definition.investmentRatioBp) / 100);

  // Un poste non applicable reste hors du scénario : réduction affichée 0, résiduel 0.
  const impacts = baseline.items.map((item) => {
    const reductionBp = item.applicable ? (definition.reductions[item.key] ?? 0) : 0;
    return {
      key: item.key,
      reductionBp,
      residual: item.applicable ? residualAmount(item.amount, reductionBp) : 0,
    };
  });

  const residualTotal = sum(impacts.map((i) => i.residual)) + definition.operatingCostPerYear;
  const savingsPerYear = baseline.total - residualTotal;
  const cumulative = Array.from(
    { length: horizonYears + 1 },
    (_, year) => investment + residualTotal * year,
  );
  const roiBp =
    investment > 0 ? ratioBp(savingsPerYear * horizonYears - investment, investment) : null;

  return {
    key: definition.key,
    label: definition.label,
    shortLabel: definition.shortLabel,
    investment,
    operatingCostPerYear: definition.operatingCostPerYear,
    impacts,
    residualTotal,
    savingsPerYear,
    totalReductionBp: ratioBp(savingsPerYear, baseline.total) ?? 0,
    paybackYearsHundredths: ratioHundredths(investment, savingsPerYear),
    roiBp,
    cumulative,
  };
}
