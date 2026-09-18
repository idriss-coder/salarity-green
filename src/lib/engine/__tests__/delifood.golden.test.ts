import { describe, expect, it } from "vitest";
import { computeSnapshot } from "../index";
import { delifoodInput } from "../fixtures/delifood";

const amount = (snapshot: ReturnType<typeof computeSnapshot>, key: string) =>
  snapshot.baseline.items.find((i) => i.key === key)!.amount;

describe("Golden DELIFOOD — baseline (page 5 du modèle)", () => {
  const snapshot = computeSnapshot(delifoodInput);

  it("reproduit chaque poste au franc près", () => {
    expect(amount(snapshot, "grid")).toBe(74_734_992);
    expect(amount(snapshot, "productionLoss")).toBe(36_500_000);
    expect(amount(snapshot, "diesel")).toBe(14_472_000);
    expect(amount(snapshot, "powerPenalty")).toBe(4_243_980);
    expect(amount(snapshot, "generatorMaintenance")).toBe(1_104_000);
    expect(amount(snapshot, "idleStaff")).toBe(790_833);
  });

  it("reproduit le total 131 845 805 FCFA", () => {
    expect(snapshot.baseline.total).toBe(131_845_805);
    expect(snapshot.baseline.totalVisible + snapshot.baseline.totalHidden).toBe(
      snapshot.baseline.total,
    );
  });

  it("marque non applicables les postes sans porte ouverte", () => {
    const material = snapshot.baseline.items.find((i) => i.key === "materialLoss")!;
    expect(material.applicable).toBe(false);
    expect(material.amount).toBe(0);
    expect(material.notApplicableReason).toBeTruthy();
  });

  it("signale l'annualisation sur 6 mois", () => {
    expect(snapshot.baseline.warnings.map((w) => w.code)).toContain("GRID_INCOMPLETE_PERIOD");
  });

  it("calcule les constats de la page 3", () => {
    expect(snapshot.baseline.outagesPerYear).toBe(365);
    expect(snapshot.baseline.unitsLostPerYear).toBe(365_000);
    expect(snapshot.future?.productionLossPerYear).toBe(73_000_000);
  });
});

describe("Golden DELIFOOD — scénarios (pages 7 et 9 du modèle ; ±1,5 % sur les montants, ±2 % sur les délais : le modèle est incohérent avec ses propres taux)", () => {
  const snapshot = computeSnapshot(delifoodInput);
  const [s1, s2, s3] = snapshot.scenarios;
  const closeTo = (actual: number, expected: number, tolerance = 0.015) =>
    expect(Math.abs(actual - expected) / expected).toBeLessThanOrEqual(tolerance);

  it("S1 Autoconsommation", () => {
    closeTo(s1.investment, 158_000_000);
    closeTo(s1.residualTotal, 96_250_000);
    closeTo(s1.savingsPerYear, 35_600_000, 0.02);
    // 4,35 ans par la formule contre 4,44 dans le modèle (dont l'économie S1 de 35,6 M ne découle pas de ses propres taux).
    closeTo(s1.paybackYearsHundredths!, 444, 0.025);
    expect(s1.totalReductionBp).toBeGreaterThanOrEqual(2700);
  });

  it("S2 Autoconsommation + 5 h", () => {
    closeTo(s2.investment, 261_000_000);
    closeTo(s2.residualTotal, 46_150_000);
    closeTo(s2.savingsPerYear, 85_700_000);
    closeTo(s2.paybackYearsHundredths!, 305, 0.02);
  });

  it("S3 Couverture totale", () => {
    closeTo(s3.investment, 489_000_000);
    closeTo(s3.savingsPerYear, 130_500_000);
    closeTo(s3.paybackYearsHundredths!, 375, 0.02);
  });

  it("recommande la proposition 2 comme le modèle", () => {
    expect(snapshot.recommendation.scenarioKey).toBe("self-consumption-storage");
    expect(snapshot.recommendation.reasons[0]).toMatch(/Délai de retour estimé à 3,0\d ans/);
  });

  it("courbe cumulée : année 0 = investissement, pente = résiduel", () => {
    expect(s2.cumulative[0]).toBe(s2.investment);
    expect(s2.cumulative[10] - s2.cumulative[9]).toBe(s2.residualTotal);
    expect(snapshot.baselineCumulative[10]).toBe(snapshot.baseline.total * 10);
  });
});

describe("Propriétés du moteur", () => {
  it("l'économie ne dépasse jamais la baseline et les taux restent dans [0, 100 %]", () => {
    const snapshot = computeSnapshot(delifoodInput);
    for (const s of snapshot.scenarios) {
      expect(s.savingsPerYear).toBeLessThanOrEqual(snapshot.baseline.total);
      for (const i of s.impacts) {
        expect(i.reductionBp).toBeGreaterThanOrEqual(0);
        expect(i.reductionBp).toBeLessThanOrEqual(10_000);
      }
    }
  });

  it("est déterministe", () => {
    expect(computeSnapshot(delifoodInput)).toEqual(computeSnapshot(delifoodInput));
  });

  it("un site sans groupe ni coûts cachés produit un rapport cohérent", () => {
    const snapshot = computeSnapshot({
      ...delifoodInput,
      generator: undefined,
      electricity: { bill: { mode: "average", monthlyAverage: 1_000_000, monthsObserved: 12 } },
      hiddenCosts: {},
    });
    expect(snapshot.baseline.warnings).toHaveLength(0);
    expect(snapshot.baseline.items.filter((i) => i.applicable).map((i) => i.key)).toEqual([
      "grid",
      "productionLoss",
    ]);
    expect(snapshot.baseline.total).toBe(12_000_000 + 36_500_000);
    for (const s of snapshot.scenarios) {
      expect(s.residualTotal).toBeLessThanOrEqual(snapshot.baseline.total);
    }
  });
});
