import type { EngineInput } from "../types";

/**
 * Jeu de référence DELIFOOD, reconstitué depuis le modèle de rapport BEG (page 5).
 * Sert de test de non-régression du moteur : total attendu 131 845 805 FCFA.
 */
export const delifoodInput: EngineInput = {
  company: {
    name: "DELIFOOD",
    sector: "Agroalimentaire",
    city: "Douala",
    contactName: "Direction",
  },
  production: {
    product: "Sachets d'eau",
    unit: "sachet",
    ratePerHour: 3000, // 50 sachets/min
    marginPerUnit: 100,
    hoursPerDay: 24,
    daysPerYear: 365,
    extension: { targetRatePerHour: 6000, targetDate: "T1 2027" },
  },
  electricity: {
    bill: { mode: "average", monthlyAverage: 6_227_916, monthsObserved: 6 },
    powerPenaltyMonthly: 353_665, // 65 kWh x 5 441 FCFA
  },
  generator: {
    fuel: { mode: "liters", litersPerMonth: 1500, pricePerLiter: 804 },
    maintenancePerYear: 1_104_000,
  },
  outages: {
    frequency: { count: 1, per: "day" },
    averageDurationMin: 20,
    productionStoppedShare: 10_000,
    catchUpShare: 0,
  },
  hiddenCosts: {
    idleStaff: { headcount: 13, hourlyCost: 500, nonRedeployedShare: 10_000 },
  },
  project: { goals: ["secure-production", "reduce-bill"], horizonYears: 10 },
};
