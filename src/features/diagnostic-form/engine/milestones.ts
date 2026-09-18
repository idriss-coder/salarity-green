import { outagesPerYear } from "@/lib/engine";
import type { Answers, FormDefinition, FrequencyValue } from "../definition/types";
import type { Step } from "./reducer";

/**
 * Jalons du parcours : un écran de respiration affiché quand l'utilisateur termine certaines sections.
 * Chaque jalon est **contextuel** : il reformule ce que l'utilisateur vient de saisir en un chiffre
 * qui lui parle (coût d'une heure d'arrêt, facture annuelle, coupures par an…), pour donner envie de continuer.
 * Module pur : aucune dépendance React, testable seul.
 */

export interface MilestoneFigure {
  value: number;
  /** `fcfa` : montant arrondi avec unité ; `integer` : entier ; `decimal1` : une décimale. */
  format: "fcfa" | "integer" | "decimal1";
  label: string;
}

export type Milestone =
  | { kind: "greeting"; base: MilestoneBase }
  | { kind: "figure"; base: MilestoneBase; figure: MilestoneFigure }
  | { kind: "pair"; base: MilestoneBase; figures: [MilestoneFigure, MilestoneFigure] }
  | { kind: "progress"; base: MilestoneBase; progress: number };

export interface MilestoneBase {
  /** Identifiant de la section terminée : sert à ne montrer chaque jalon qu'une fois. */
  id: string;
  /** « Étape 2 sur 8 · Votre production ». */
  eyebrow: string;
  title: string;
  detail: string;
  /** Durée d'affichage avant fermeture automatique. */
  durationMs: number;
}

/** Sections dont la fin déclenche un jalon. Les autres s'enchaînent sans interruption. */
const MILESTONE_SECTIONS = new Set(["company", "production", "generator", "outages", "hidden"]);

const MONTHS = 12;

function num(answers: Answers, id: string): number | undefined {
  const v = answers[id];
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}

function yes(answers: Answers, id: string): boolean {
  return answers[id] === true;
}

/** La question à `index` est-elle la dernière visible de sa section ? */
export function endsSection(steps: readonly Step[], index: number): boolean {
  const next = steps[index + 1];
  return next !== undefined && next.isSectionStart;
}

function base(
  definition: FormDefinition,
  sectionId: string,
  title: string,
  detail: string,
  durationMs: number,
): MilestoneBase {
  const sections = definition.sections;
  const position = sections.findIndex((s) => s.id === sectionId);
  const section = sections[position];
  return {
    id: sectionId,
    eyebrow: `Étape ${position + 1} sur ${sections.length} · ${section?.title ?? ""}`,
    title,
    detail,
    durationMs,
  };
}

/** Coût annuel de l'énergie déjà payée : facture réseau, pénalité de puissance, carburant et entretien du groupe. */
export function annualEnergySpend(answers: Answers): number | undefined {
  const bill = num(answers, "electricity.monthlyAverage");
  if (bill === undefined) return undefined;
  let total = bill * MONTHS;
  if (yes(answers, "electricity.hasPowerPenalty")) {
    total += (num(answers, "electricity.powerPenaltyMonthly") ?? 0) * MONTHS;
  }
  if (yes(answers, "generator.has")) {
    const mode = answers["generator.fuelMode"];
    if (mode === "liters") {
      total +=
        (num(answers, "generator.litersPerMonth") ?? 0) *
        (num(answers, "generator.pricePerLiter") ?? 0) *
        MONTHS;
    } else if (mode === "amount") {
      total += (num(answers, "generator.amountPerMonth") ?? 0) * MONTHS;
    }
    total += num(answers, "generator.maintenancePerYear") ?? 0;
  }
  return total;
}

/**
 * Jalon à afficher quand la section `sectionId` vient d'être terminée, ou `null` si cette section
 * n'en a pas (ou si les réponses nécessaires manquent : on préfère ne rien montrer qu'un chiffre faux).
 * `progress` est la progression 0..1 après la réponse courante.
 */
export function milestoneFor(
  definition: FormDefinition,
  sectionId: string,
  answers: Answers,
  progress: number,
): Milestone | null {
  if (!MILESTONE_SECTIONS.has(sectionId)) return null;

  switch (sectionId) {
    case "company": {
      const name = String(answers["company.name"] ?? "").trim();
      if (!name) return null;
      return {
        kind: "greeting",
        base: base(
          definition,
          sectionId,
          `Enchanté, ${name}.`,
          "Parlons maintenant de ce que vous produisez : c'est ce qui donne un prix à chaque arrêt.",
          4100,
        ),
      };
    }

    case "production": {
      const rate = num(answers, "production.ratePerHour");
      const margin = num(answers, "production.marginPerUnit");
      if (rate === undefined || margin === undefined) return null;
      const perHour = rate * margin;
      if (perHour <= 0) return null;
      return {
        kind: "figure",
        base: base(
          definition,
          sectionId,
          "Chaque heure d'arrêt vous coûte",
          "C'est le chiffre qui pilote tout le rapport. Voyons maintenant ce que vous payez déjà pour l'électricité.",
          4900,
        ),
        figure: { value: perHour, format: "fcfa", label: "de marge non produite" },
      };
    }

    case "generator": {
      const spend = annualEnergySpend(answers);
      if (spend === undefined || spend <= 0) return null;
      const withGenerator = yes(answers, "generator.has");
      return {
        kind: "figure",
        base: base(
          definition,
          sectionId,
          "Votre énergie vous coûte déjà",
          progress >= 0.5
            ? "Plus de la moitié du diagnostic est faite. Décrivons maintenant les coupures que vous subissez."
            : "Décrivons maintenant les coupures que vous subissez.",
          4900,
        ),
        figure: {
          value: spend,
          format: "fcfa",
          label: withGenerator ? "par an, réseau et groupe compris" : "par an, rien que le réseau",
        },
      };
    }

    case "outages": {
      const frequency = answers["outages.frequency"] as FrequencyValue | undefined;
      const duration = num(answers, "outages.durationMin");
      if (!frequency || typeof frequency.count !== "number" || duration === undefined) return null;
      const perYear = outagesPerYear({
        frequency,
        averageDurationMin: duration,
        productionStoppedShare: 0,
        catchUpShare: 0,
      });
      if (perYear <= 0) return null;
      const hours = (perYear * duration) / 60;
      return {
        kind: "pair",
        base: base(
          definition,
          sectionId,
          "Sur un an, cela représente",
          "Reste à chiffrer ce que ces heures coûtent au-delà de la production perdue.",
          4900,
        ),
        figures: [
          { value: perYear, format: "integer", label: perYear > 1 ? "coupures" : "coupure" },
          { value: hours, format: hours < 10 ? "decimal1" : "integer", label: "heures d'arrêt" },
        ],
      };
    }

    case "hidden":
      return {
        kind: "progress",
        base: base(
          definition,
          sectionId,
          "Le plus dur est fait.",
          "Deux questions sur votre projet, un récapitulatif, et votre rapport est prêt.",
          4300,
        ),
        progress,
      };

    default:
      return null;
  }
}
