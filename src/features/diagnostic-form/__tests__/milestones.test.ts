import { describe, expect, it } from "vitest";
import { formDefinition } from "../definition/form.definition";
import { annualEnergySpend, endsSection, milestoneFor } from "../engine/milestones";
import { steps } from "../engine/reducer";

const def = formDefinition;

describe("endsSection", () => {
  it("détecte la dernière question visible d'une section", () => {
    const all = steps(def, { "company.name": "DELIFOOD" });
    const lastCompany = all.findIndex((s) => s.question.id === "company.contactName");
    expect(endsSection(all, lastCompany)).toBe(true);
    expect(endsSection(all, lastCompany - 1)).toBe(false);
  });

  it("une porte fermée fait de la porte la fin de section", () => {
    const all = steps(def, { "generator.has": false });
    const gate = all.findIndex((s) => s.question.id === "generator.has");
    expect(endsSection(all, gate)).toBe(true);
  });

  it("la dernière question du formulaire ne termine aucune section", () => {
    const all = steps(def, {});
    expect(endsSection(all, all.length - 1)).toBe(false);
  });
});

describe("milestoneFor", () => {
  it("salue l'entreprise par son nom", () => {
    const m = milestoneFor(def, "company", { "company.name": "  DELIFOOD " }, 0.1);
    expect(m?.kind).toBe("greeting");
    expect(m?.base.title).toBe("Enchanté, DELIFOOD.");
    expect(m?.base.eyebrow).toBe("Étape 1 sur 8 · Votre entreprise");
  });

  it("ne montre rien sans nom d'entreprise", () => {
    expect(milestoneFor(def, "company", {}, 0.1)).toBeNull();
  });

  it("chiffre la marge perdue par heure d'arrêt", () => {
    const m = milestoneFor(
      def,
      "production",
      { "production.ratePerHour": 3000, "production.marginPerUnit": 25 },
      0.3,
    );
    expect(m).toMatchObject({ kind: "figure", figure: { value: 75_000, format: "fcfa" } });
  });

  it("additionne réseau, pénalité, carburant et entretien", () => {
    const answers = {
      "electricity.monthlyAverage": 1_000_000,
      "electricity.hasPowerPenalty": true,
      "electricity.powerPenaltyMonthly": 50_000,
      "generator.has": true,
      "generator.fuelMode": "liters",
      "generator.litersPerMonth": 1000,
      "generator.pricePerLiter": 800,
      "generator.maintenancePerYear": 600_000,
    };
    expect(annualEnergySpend(answers)).toBe(12_000_000 + 600_000 + 9_600_000 + 600_000);
    const m = milestoneFor(def, "generator", answers, 0.6);
    expect(m).toMatchObject({ kind: "figure", figure: { value: 22_800_000 } });
    if (m?.kind === "figure") expect(m.figure.label).toContain("groupe");
  });

  it("sans groupe, ne compte que le réseau", () => {
    const m = milestoneFor(
      def,
      "generator",
      { "electricity.monthlyAverage": 500_000, "generator.has": false },
      0.4,
    );
    expect(m).toMatchObject({ kind: "figure", figure: { value: 6_000_000 } });
    if (m?.kind === "figure") expect(m.figure.label).toContain("réseau");
  });

  it("convertit la fréquence en coupures et heures par an", () => {
    const m = milestoneFor(
      def,
      "outages",
      { "outages.frequency": { count: 3, per: "week" }, "outages.durationMin": 90 },
      0.7,
    );
    expect(m?.kind).toBe("pair");
    if (m?.kind === "pair") {
      expect(m.figures[0].value).toBe(156);
      expect(m.figures[1].value).toBe(234);
    }
  });

  it("les sections sans jalon renvoient null", () => {
    expect(milestoneFor(def, "electricity", { "electricity.monthlyAverage": 1 }, 0.5)).toBeNull();
    expect(milestoneFor(def, "project", {}, 0.9)).toBeNull();
    expect(milestoneFor(def, "final", {}, 1)).toBeNull();
  });

  it("le jalon des coûts cachés porte la progression", () => {
    const m = milestoneFor(def, "hidden", {}, 0.87);
    expect(m).toMatchObject({ kind: "progress", progress: 0.87 });
  });
});
