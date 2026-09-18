import { describe, expect, it } from "vitest";
import { formDefinition } from "../definition/form.definition";
import { createReducer, currentStep, initialState, progress, steps } from "../engine/reducer";

const reduce = createReducer(formDefinition);

describe("Moteur d'étapes", () => {
  it("commence sur la première question de la première section", () => {
    const step = currentStep(formDefinition, initialState);
    expect(step.question.id).toBe("company.name");
    expect(step.isSectionStart).toBe(true);
  });

  it("fait apparaître les questions conditionnelles après une porte ouverte", () => {
    const before = steps(formDefinition, { "generator.has": false }).map((s) => s.question.id);
    const after = steps(formDefinition, {
      "generator.has": true,
      "generator.fuelMode": "amount",
    }).map((s) => s.question.id);
    expect(before).not.toContain("generator.amountPerMonth");
    expect(after).toContain("generator.amountPerMonth");
    expect(after).not.toContain("generator.litersPerMonth");
  });

  it("borne la navigation et recale l'index quand des questions disparaissent", () => {
    let state = reduce(initialState, { type: "prev" });
    expect(state.index).toBe(0);
    state = reduce(state, { type: "goTo", index: 9999 });
    expect(state.index).toBe(steps(formDefinition, {}).length - 1);
    const withGenerator = reduce(
      { ...initialState, answers: { "generator.has": true } },
      { type: "goTo", index: 9999 },
    );
    const closed = reduce(withGenerator, { type: "answer", id: "generator.has", value: false });
    expect(currentStep(formDefinition, closed)).toBeDefined();
  });

  it("calcule la progression sur les questions visibles", () => {
    expect(progress(formDefinition, {})).toBe(0);
    const p = progress(formDefinition, { "company.name": "X", "company.sector": "autre" });
    expect(p).toBeGreaterThan(0);
    expect(p).toBeLessThan(0.2);
  });
});
