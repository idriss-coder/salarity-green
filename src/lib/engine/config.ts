import type { CostKey, ScenarioDefinition } from "./types";

/** Version du moteur, stockée dans chaque snapshot. À incrémenter à chaque changement de formule ou de catalogue. */
export const ENGINE_VERSION = "1.0.0";

export const DEFAULT_HORIZON_YEARS = 10;

/** Libellés des postes, dans l'ordre d'affichage du rapport (pages 4, 5 et 7). */
export const COST_LABELS: Record<CostKey, string> = {
  grid: "Facture réseau",
  productionLoss: "Pertes de production",
  diesel: "Consommation diesel",
  powerPenalty: "Dépassement de puissance",
  generatorMaintenance: "Maintenance groupe",
  idleStaff: "Personnel immobilisé",
  materialLoss: "Matières perdues",
  customerPenalty: "Pénalités clients",
};

export const COST_ORDER: CostKey[] = [
  "grid",
  "productionLoss",
  "diesel",
  "powerPenalty",
  "generatorMaintenance",
  "idleStaff",
  "materialLoss",
  "customerPenalty",
];

/**
 * Catalogue des scénarios.
 * Taux calibrés sur le rapport DELIFOOD ; ratios d'investissement = investissement / facture réseau annuelle
 * du même rapport (158 / 261 / 489 M pour 74,73 M → 2,11 / 3,49 / 6,54). À remplacer par la grille Solarity quand elle existera.
 */
export const SCENARIOS: ScenarioDefinition[] = [
  {
    key: "self-consumption",
    label: "Autoconsommation solaire",
    shortLabel: "Autoconsommation",
    reductions: { grid: 4850 },
    investmentRatioBp: 211,
    operatingCostPerYear: 0,
  },
  {
    key: "self-consumption-storage",
    label: "Autoconsommation + stockage 5 h",
    shortLabel: "Autoconso + 5h",
    reductions: {
      grid: 4850,
      productionLoss: 10000,
      diesel: 4760,
      powerPenalty: 10000,
      generatorMaintenance: 5600,
      idleStaff: 10000,
      materialLoss: 10000,
      customerPenalty: 10000,
    },
    investmentRatioBp: 349,
    operatingCostPerYear: 0,
  },
  {
    key: "full-coverage",
    label: "Couverture totale",
    shortLabel: "Couverture totale",
    reductions: {
      grid: 10000,
      productionLoss: 10000,
      diesel: 9900,
      powerPenalty: 10000,
      generatorMaintenance: 9300,
      idleStaff: 10000,
      materialLoss: 10000,
      customerPenalty: 10000,
    },
    investmentRatioBp: 654,
    operatingCostPerYear: 0,
  },
];

/** Deux scénarios dont le délai de retour diffère de moins de cette valeur (centièmes d'année) sont à égalité. */
export const PAYBACK_TIE_HUNDREDTHS = 25;

/** Au-delà de cette durée moyenne (minutes), la coupure est signalée comme extrême. */
export const OUTAGE_DURATION_EXTREME_MIN = 8 * 60;
