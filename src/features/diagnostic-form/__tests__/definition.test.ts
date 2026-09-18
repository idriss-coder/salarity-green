import { describe, expect, it } from "vitest";
import { computeSnapshot } from "@/lib/engine";
import { allQuestions, visibleQuestions } from "../definition/conditions";
import { delifoodAnswers } from "../definition/fixtures";
import { formDefinition } from "../definition/form.definition";
import { answersSchema } from "../definition/schema";
import { toEngineInput } from "../definition/to-engine-input";

describe("Définition du formulaire", () => {
  it("a des identifiants de questions uniques", () => {
    const ids = allQuestions(formDefinition).map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("cache les questions conditionnelles tant que la porte est fermée", () => {
    const visibleEmpty = visibleQuestions(formDefinition, {}).map((v) => v.question.id);
    expect(visibleEmpty).not.toContain("generator.litersPerMonth");
    expect(visibleEmpty).not.toContain("electricity.months");
    const visibleDelifood = visibleQuestions(formDefinition, delifoodAnswers).map(
      (v) => v.question.id,
    );
    expect(visibleDelifood).toContain("generator.litersPerMonth");
    expect(visibleDelifood).not.toContain("generator.amountPerMonth");
    expect(visibleDelifood).not.toContain("hidden.quantityPerOutage");
  });
});

describe("Validation des réponses", () => {
  it("accepte le jeu DELIFOOD et supprime les réponses invisibles", () => {
    const result = answersSchema.safeParse({ ...delifoodAnswers, "generator.amountPerMonth": 999 });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data["generator.amountPerMonth"]).toBeUndefined();
  });

  it("refuse une réponse requise manquante et un email invalide", () => {
    const result = answersSchema.safeParse({
      ...delifoodAnswers,
      "production.ratePerHour": undefined,
      "contact.email": "pas-un-email",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join("."));
      expect(paths).toContain("production.ratePerHour");
      expect(paths).toContain("contact.email");
    }
  });

  it("n'exige pas les questions cachées", () => {
    const result = answersSchema.safeParse({
      ...delifoodAnswers,
      "generator.has": false,
      "generator.litersPerMonth": undefined,
      "generator.pricePerLiter": undefined,
      "generator.maintenancePerYear": undefined,
    });
    expect(result.success).toBe(true);
  });
});

describe("Projection vers le moteur", () => {
  it("les réponses DELIFOOD donnent le total de référence", () => {
    const parsed = answersSchema.parse(delifoodAnswers);
    const snapshot = computeSnapshot(toEngineInput(parsed));
    expect(snapshot.baseline.total).toBe(131_845_805);
    expect(snapshot.recommendation.scenarioKey).toBe("self-consumption-storage");
  });

  it("le mode détaillé somme les factures saisies", () => {
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: `2025-${String(i + 1).padStart(2, "0")}`,
      amount: 1_000_000,
    }));
    const parsed = answersSchema.parse({
      ...delifoodAnswers,
      "electricity.wantsDetail": true,
      "electricity.months": months,
    });
    const snapshot = computeSnapshot(toEngineInput(parsed));
    expect(snapshot.baseline.items[0].amount).toBe(12_000_000);
    expect(snapshot.baseline.warnings.map((w) => w.code)).not.toContain("GRID_INCOMPLETE_PERIOD");
  });
});
