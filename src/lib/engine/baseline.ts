import { COST_LABELS, COST_ORDER, OUTAGE_DURATION_EXTREME_MIN } from "./config";
import { applyBp, complementBp, formatFcfa, formatNumber, roundMoney, sum } from "./money";
import type {
  Baseline,
  CostItem,
  CostKey,
  EngineInput,
  FutureContext,
  OutagesInput,
  Warning,
} from "./types";

const DAYS_PER_YEAR = 365;
const WEEKS_PER_YEAR = 52;
const MONTHS_PER_YEAR = 12;

/** Nombre de coupures par an à partir de la fréquence déclarée. */
export function outagesPerYear(outages: OutagesInput): number {
  const { count, per } = outages.frequency;
  switch (per) {
    case "day":
      return count * DAYS_PER_YEAR;
    case "week":
      return count * WEEKS_PER_YEAR;
    case "month":
      return count * MONTHS_PER_YEAR;
  }
}

/** Contexte partagé par les postes dépendant des coupures. */
interface OutageContext {
  perYear: number;
  durationMin: number;
  hoursPerYear: number;
}

function outageContext(input: EngineInput): OutageContext {
  const perYear = outagesPerYear(input.outages);
  const durationMin = input.outages.averageDurationMin;
  return { perYear, durationMin, hoursPerYear: (perYear * durationMin) / 60 };
}

function notApplicable(key: CostKey, category: CostItem["category"], reason: string): CostItem {
  return {
    key,
    label: COST_LABELS[key],
    category,
    applicable: false,
    notApplicableReason: reason,
    amount: 0,
    formulaLabel: "",
    formulaDetail: "",
    warnings: [],
  };
}

// ---------------------------------------------------------------------------
// Postes visibles
// ---------------------------------------------------------------------------

function gridItem(input: EngineInput): CostItem {
  const bill = input.electricity.bill;
  const warnings: Warning[] = [];

  if (bill.mode === "average") {
    const amount = roundMoney(bill.monthlyAverage * MONTHS_PER_YEAR);
    if (bill.monthsObserved < MONTHS_PER_YEAR) {
      warnings.push({
        code: "GRID_INCOMPLETE_PERIOD",
        message: `Facture réseau annualisée à partir de ${bill.monthsObserved} mois observés.`,
      });
    }
    return {
      key: "grid",
      label: COST_LABELS.grid,
      category: "visible",
      applicable: true,
      amount,
      formulaLabel: `Coût moyen sur ${bill.monthsObserved} mois x 12`,
      formulaDetail: `${formatFcfa(bill.monthlyAverage)}/mois x 12`,
      warnings,
    };
  }

  const months = bill.months.filter((m) => m.amount > 0);
  const seen = new Set<string>();
  for (const m of months) {
    if (seen.has(m.month)) {
      warnings.push({ code: "GRID_DUPLICATE_MONTH", message: `Mois en double : ${m.month}.` });
    }
    seen.add(m.month);
  }
  const observed = seen.size;
  const total = sum(months.map((m) => m.amount));

  if (observed >= MONTHS_PER_YEAR) {
    return {
      key: "grid",
      label: COST_LABELS.grid,
      category: "visible",
      applicable: true,
      amount: total,
      formulaLabel: "Somme des 12 dernières factures",
      formulaDetail: `12 factures mensuelles`,
      warnings,
    };
  }

  const monthlyAverage = observed > 0 ? total / observed : 0;
  warnings.push({
    code: "GRID_INCOMPLETE_PERIOD",
    message: `Facture réseau annualisée à partir de ${observed} factures saisies.`,
  });
  return {
    key: "grid",
    label: COST_LABELS.grid,
    category: "visible",
    applicable: true,
    amount: roundMoney(monthlyAverage * MONTHS_PER_YEAR),
    formulaLabel: `Moyenne des ${observed} factures x 12`,
    formulaDetail: `${formatFcfa(roundMoney(monthlyAverage))}/mois x 12`,
    warnings,
  };
}

function dieselItem(input: EngineInput): CostItem {
  const generator = input.generator;
  if (!generator) return notApplicable("diesel", "visible", "Pas de groupe électrogène");

  const fuel = generator.fuel;
  if (fuel.mode === "liters") {
    return {
      key: "diesel",
      label: COST_LABELS.diesel,
      category: "visible",
      applicable: true,
      amount: roundMoney(fuel.litersPerMonth * fuel.pricePerLiter * MONTHS_PER_YEAR),
      formulaLabel: "Consommation mensuelle (l) x prix du litre x 12",
      formulaDetail: `${formatNumber(fuel.litersPerMonth)} l/mois x ${formatFcfa(fuel.pricePerLiter)}/l x 12 mois`,
      warnings: [],
    };
  }
  return {
    key: "diesel",
    label: COST_LABELS.diesel,
    category: "visible",
    applicable: true,
    amount: roundMoney(fuel.amountPerMonth * MONTHS_PER_YEAR),
    formulaLabel: "Dépense carburant mensuelle x 12",
    formulaDetail: `${formatFcfa(fuel.amountPerMonth)}/mois x 12 mois`,
    warnings: [],
  };
}

function generatorMaintenanceItem(input: EngineInput): CostItem {
  const generator = input.generator;
  if (!generator)
    return notApplicable("generatorMaintenance", "visible", "Pas de groupe électrogène");
  return {
    key: "generatorMaintenance",
    label: COST_LABELS.generatorMaintenance,
    category: "visible",
    applicable: true,
    amount: roundMoney(generator.maintenancePerYear),
    formulaLabel: "Estimation annuelle",
    formulaDetail: "-",
    warnings: [],
  };
}

function powerPenaltyItem(input: EngineInput): CostItem {
  const monthly = input.electricity.powerPenaltyMonthly;
  if (monthly === undefined) {
    return notApplicable("powerPenalty", "visible", "Aucune pénalité de puissance facturée");
  }
  return {
    key: "powerPenalty",
    label: COST_LABELS.powerPenalty,
    category: "visible",
    applicable: true,
    amount: roundMoney(monthly * MONTHS_PER_YEAR),
    formulaLabel: "Dépassement facturé par mois x 12",
    formulaDetail: `${formatFcfa(monthly)}/mois x 12 mois`,
    warnings: [],
  };
}

// ---------------------------------------------------------------------------
// Postes cachés
// ---------------------------------------------------------------------------

/** Unités perdues par an à une cadence donnée (non arrondi). */
function unitsLost(input: EngineInput, ctx: OutageContext, ratePerHour: number): number {
  const { productionStoppedShare, catchUpShare } = input.outages;
  const ratePerMin = ratePerHour / 60;
  return (
    ctx.perYear *
    ctx.durationMin *
    ratePerMin *
    (productionStoppedShare / 10_000) *
    (complementBp(catchUpShare) / 10_000)
  );
}

function productionLossItem(input: EngineInput, ctx: OutageContext): CostItem {
  const { production, outages } = input;
  const ratePerMin = production.ratePerHour / 60;
  const units = unitsLost(input, ctx, production.ratePerHour);
  const amount = roundMoney(units * production.marginPerUnit);

  const factors = [
    `${formatNumber(ratePerMin, Number.isInteger(ratePerMin) ? 0 : 2)} ${production.unit}s/min`,
    `${formatNumber(ctx.durationMin)} min`,
    `${formatNumber(ctx.perYear)}`,
  ];
  if (outages.productionStoppedShare < 10_000)
    factors.push(`${outages.productionStoppedShare / 100} % arrêtés`);
  if (outages.catchUpShare > 0)
    factors.push(`${complementBp(outages.catchUpShare) / 100} % non rattrapés`);
  factors.push(formatFcfa(production.marginPerUnit));

  const warnings: Warning[] = [];
  if (ctx.durationMin > OUTAGE_DURATION_EXTREME_MIN) {
    warnings.push({
      code: "OUTAGE_DURATION_EXTREME",
      message: `Durée moyenne de coupure très élevée (${formatNumber(ctx.durationMin)} min).`,
    });
  }

  return {
    key: "productionLoss",
    label: COST_LABELS.productionLoss,
    category: "hidden",
    applicable: true,
    amount,
    formulaLabel: `Cadence (nbr ${production.unit}s/min) x nombre min par an x marge unitaire par ${production.unit}`,
    formulaDetail: factors.join(" x "),
    warnings,
  };
}

function idleStaffItem(input: EngineInput, ctx: OutageContext): CostItem {
  const staff = input.hiddenCosts.idleStaff;
  if (!staff) return notApplicable("idleStaff", "hidden", "Personnel redéployé ou non concerné");
  const amount = roundMoney(
    ctx.hoursPerYear * staff.headcount * staff.hourlyCost * (staff.nonRedeployedShare / 10_000),
  );
  const factors = [
    `${staff.headcount}`,
    `(${formatNumber(ctx.durationMin)}/60 x ${formatNumber(ctx.perYear)}) h`,
    formatFcfa(staff.hourlyCost),
  ];
  if (staff.nonRedeployedShare < 10_000)
    factors.push(`${staff.nonRedeployedShare / 100} % non redéployés`);
  return {
    key: "idleStaff",
    label: COST_LABELS.idleStaff,
    category: "hidden",
    applicable: true,
    amount,
    formulaLabel: "Nombre d'opérateurs en arrêt x temps d'arrêt annuel en h x coût horaire",
    formulaDetail: factors.join(" x "),
    warnings: [],
  };
}

function materialLossItem(input: EngineInput, ctx: OutageContext): CostItem {
  const material = input.hiddenCosts.materialLoss;
  if (!material)
    return notApplicable("materialLoss", "hidden", "Aucune matière perdue lors des coupures");
  const amount = roundMoney(
    ctx.perYear *
      material.quantityPerOutage *
      material.unitCost *
      (material.nonRecoverableShare / 10_000),
  );
  const factors = [
    `${formatNumber(ctx.perYear)} coupures`,
    `${formatNumber(material.quantityPerOutage, 2)}`,
    formatFcfa(material.unitCost),
  ];
  if (material.nonRecoverableShare < 10_000)
    factors.push(`${material.nonRecoverableShare / 100} % non récupérés`);
  return {
    key: "materialLoss",
    label: COST_LABELS.materialLoss,
    category: "hidden",
    applicable: true,
    amount,
    formulaLabel: "Coupures par an x quantité perdue x coût unitaire x part non récupérée",
    formulaDetail: factors.join(" x "),
    warnings: [],
  };
}

function customerPenaltyItem(input: EngineInput): CostItem {
  const yearly = input.hiddenCosts.customerPenaltyPerYear;
  if (yearly === undefined)
    return notApplicable("customerPenalty", "hidden", "Aucune pénalité client déclarée");
  return {
    key: "customerPenalty",
    label: COST_LABELS.customerPenalty,
    category: "hidden",
    applicable: true,
    amount: roundMoney(yearly),
    formulaLabel: "Montant annuel déclaré",
    formulaDetail: "-",
    warnings: [],
  };
}

// ---------------------------------------------------------------------------
// Assemblage
// ---------------------------------------------------------------------------

export function computeBaseline(input: EngineInput): Baseline {
  const ctx = outageContext(input);
  const byKey: Record<CostKey, CostItem> = {
    grid: gridItem(input),
    productionLoss: productionLossItem(input, ctx),
    diesel: dieselItem(input),
    powerPenalty: powerPenaltyItem(input),
    generatorMaintenance: generatorMaintenanceItem(input),
    idleStaff: idleStaffItem(input, ctx),
    materialLoss: materialLossItem(input, ctx),
    customerPenalty: customerPenaltyItem(input),
  };
  const items = COST_ORDER.map((key) => byKey[key]);
  const applicable = items.filter((i) => i.applicable);
  const totalVisible = sum(applicable.filter((i) => i.category === "visible").map((i) => i.amount));
  const totalHidden = sum(applicable.filter((i) => i.category === "hidden").map((i) => i.amount));

  return {
    items,
    total: totalVisible + totalHidden,
    totalVisible,
    totalHidden,
    outagesPerYear: ctx.perYear,
    outageHoursPerYear: ctx.hoursPerYear,
    unitsLostPerYear: Math.round(unitsLost(input, ctx, input.production.ratePerHour)),
    warnings: items.flatMap((i) => i.warnings),
  };
}

/** Pertes de production recalculées à la cadence cible (page 3 : « manque à gagner pour la cible »). */
export function computeFuture(input: EngineInput): FutureContext | undefined {
  const extension = input.production.extension;
  if (!extension) return undefined;
  const ctx = outageContext(input);
  const units = unitsLost(input, ctx, extension.targetRatePerHour);
  return {
    targetRatePerHour: extension.targetRatePerHour,
    targetDate: extension.targetDate,
    unitsLostPerYear: Math.round(units),
    productionLossPerYear: roundMoney(units * input.production.marginPerUnit),
  };
}

/** Réduction appliquée à un poste : montant résiduel arrondi au franc. */
export function residualAmount(amount: number, reductionBp: number): number {
  return applyBp(amount, complementBp(reductionBp));
}
