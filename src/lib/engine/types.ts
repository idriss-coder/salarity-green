/**
 * Types du moteur de calcul.
 *
 * Conventions :
 * - Montants en FCFA **entiers** (jamais de float pour l'argent).
 * - Taux (réduction, part, rattrapage) en **centièmes de pour cent entiers** : 4850 = 48,50 %.
 * - Le moteur est pur : `computeSnapshot(input)` ne lit ni l'heure, ni l'environnement, ni la base.
 */

/** Taux exprimé en centièmes de pour cent (10000 = 100 %). */
export type Bp = number;

export const COST_KEYS = [
  "grid",
  "productionLoss",
  "diesel",
  "powerPenalty",
  "generatorMaintenance",
  "idleStaff",
  "materialLoss",
  "customerPenalty",
] as const;
export type CostKey = (typeof COST_KEYS)[number];

export type CostCategory = "visible" | "hidden";

// ---------------------------------------------------------------------------
// Entrées (projection typée des réponses du formulaire)
// ---------------------------------------------------------------------------

export interface CompanyInput {
  name: string;
  sector: string;
  city: string;
  contactName?: string;
}

export interface ProductionInput {
  product: string;
  /** Libellé de l'unité produite : « sachet », « kg »… */
  unit: string;
  /** Unités produites par heure. */
  ratePerHour: number;
  /** Marge contributive par unité, FCFA. */
  marginPerUnit: number;
  hoursPerDay: number;
  daysPerYear: number;
  /** Projet d'extension : cadence cible et échéance (texte libre, ex. « T1 2027 »). */
  extension?: { targetRatePerHour: number; targetDate?: string };
}

export type GridBillInput =
  | { mode: "average"; monthlyAverage: number; monthsObserved: number }
  | { mode: "detail"; months: Array<{ month: string; amount: number }> };

export interface ElectricityInput {
  bill: GridBillInput;
  /** Pénalité ou dépassement de puissance facturé : montant mensuel moyen. `undefined` = non applicable. */
  powerPenaltyMonthly?: number;
}

export type GeneratorFuelInput =
  | { mode: "liters"; litersPerMonth: number; pricePerLiter: number }
  | { mode: "amount"; amountPerMonth: number };

export interface GeneratorInput {
  fuel: GeneratorFuelInput;
  maintenancePerYear: number;
}

export interface OutagesInput {
  frequency: { count: number; per: "day" | "week" | "month" };
  /** Durée moyenne d'une coupure, en minutes. */
  averageDurationMin: number;
  /** Part de la production arrêtée pendant une coupure. */
  productionStoppedShare: Bp;
  /** Part de la production rattrapée plus tard. */
  catchUpShare: Bp;
}

export interface IdleStaffInput {
  headcount: number;
  hourlyCost: number;
  /** Part non redéployée pendant l'arrêt. */
  nonRedeployedShare: Bp;
}

export interface MaterialLossInput {
  quantityPerOutage: number;
  unitCost: number;
  nonRecoverableShare: Bp;
}

export interface HiddenCostsInput {
  idleStaff?: IdleStaffInput;
  materialLoss?: MaterialLossInput;
  /** Pénalités clients / commandes perdues : montant annuel déclaré. */
  customerPenaltyPerYear?: number;
}

export interface ProjectInput {
  goals: string[];
  horizonYears: number;
}

export interface EngineInput {
  company: CompanyInput;
  production: ProductionInput;
  electricity: ElectricityInput;
  /** `undefined` = pas de groupe électrogène. */
  generator?: GeneratorInput;
  outages: OutagesInput;
  hiddenCosts: HiddenCostsInput;
  project: ProjectInput;
}

// ---------------------------------------------------------------------------
// Sorties (snapshot immuable)
// ---------------------------------------------------------------------------

export type WarningCode =
  "GRID_INCOMPLETE_PERIOD" | "GRID_DUPLICATE_MONTH" | "OUTAGE_DURATION_EXTREME" | "ESTIMATED_VALUE";

export interface Warning {
  code: WarningCode;
  message: string;
}

export interface CostItem {
  key: CostKey;
  label: string;
  category: CostCategory;
  applicable: boolean;
  /** Raison de la non-applicabilité, conservée au lieu d'un zéro ambigu. */
  notApplicableReason?: string;
  amount: number;
  /** Formule lisible, colonne « Formule » de la page 5. */
  formulaLabel: string;
  /** Détail chiffré, colonne « Détails calculs » de la page 5. */
  formulaDetail: string;
  warnings: Warning[];
}

export interface Baseline {
  items: CostItem[];
  total: number;
  totalVisible: number;
  totalHidden: number;
  /** Indicateurs dérivés repris dans les constats (page 3). */
  outagesPerYear: number;
  outageHoursPerYear: number;
  unitsLostPerYear: number;
  warnings: Warning[];
}

export interface FutureContext {
  targetRatePerHour: number;
  targetDate?: string;
  unitsLostPerYear: number;
  productionLossPerYear: number;
}

export interface ScenarioDefinition {
  key: string;
  label: string;
  shortLabel: string;
  /** Taux de réduction par poste (centièmes de %). Poste absent = 0. */
  reductions: Partial<Record<CostKey, Bp>>;
  /** Investissement = ratio × facture réseau annuelle (centièmes : 210 = 2,10 ×). */
  investmentRatioBp: number;
  /** Coûts d'exploitation annuels du scénario (FCFA). */
  operatingCostPerYear: number;
}

export interface ScenarioResult {
  key: string;
  label: string;
  shortLabel: string;
  investment: number;
  operatingCostPerYear: number;
  /** Réduction et résiduel par poste, dans l'ordre de `baseline.items`. */
  impacts: Array<{ key: CostKey; reductionBp: Bp; residual: number }>;
  residualTotal: number;
  savingsPerYear: number;
  totalReductionBp: Bp;
  /** Délai de retour simple en centièmes d'année (306 = 3,06 ans) ; `null` si économie ≤ 0. */
  paybackYearsHundredths: number | null;
  /** ROI à l'horizon, centièmes de % ; `null` si investissement nul. */
  roiBp: Bp | null;
  /** Coût cumulé années 0..N (année 0 = investissement). */
  cumulative: number[];
}

export interface Recommendation {
  scenarioKey: string;
  reasons: string[];
}

export interface Snapshot {
  engineVersion: string;
  currency: "FCFA";
  horizonYears: number;
  baseline: Baseline;
  future?: FutureContext;
  /** Courbe « situation actuelle » : années 0..N sans investissement. */
  baselineCumulative: number[];
  scenarios: ScenarioResult[];
  recommendation: Recommendation;
}
