import { pctToBp } from "@/lib/engine/money";
import type { EngineInput, GridBillInput } from "@/lib/engine/types";
import type { Answers, FrequencyValue, MonthAmount } from "./types";

/**
 * Projette les réponses validées (clés plates) vers l'entrée typée du moteur.
 * Toute règle « réponse → donnée métier » vit ici et nulle part ailleurs.
 */
export function toEngineInput(a: Answers): EngineInput {
  const str = (key: string) => String(a[key] ?? "");
  const num = (key: string) => Number(a[key]);
  const opt = (key: string) => (a[key] === undefined ? undefined : Number(a[key]));

  const bill: GridBillInput =
    a["electricity.wantsDetail"] === true && Array.isArray(a["electricity.months"])
      ? {
          mode: "detail",
          months: (a["electricity.months"] as MonthAmount[])
            .filter((m) => m.amount !== null && m.amount > 0)
            .map((m) => ({ month: m.month, amount: m.amount as number })),
        }
      : {
          mode: "average",
          monthlyAverage: num("electricity.monthlyAverage"),
          monthsObserved: num("electricity.monthsObserved"),
        };

  const frequency = a["outages.frequency"] as FrequencyValue;

  return {
    company: {
      name: str("company.name"),
      sector: str("company.sector"),
      city: str("company.city"),
      contactName: a["company.contactName"] ? str("company.contactName") : undefined,
    },
    production: {
      product: str("production.product"),
      unit: str("production.unit"),
      ratePerHour: num("production.ratePerHour"),
      marginPerUnit: num("production.marginPerUnit"),
      hoursPerDay: num("production.hoursPerDay"),
      daysPerYear: num("production.daysPerYear"),
      extension:
        a["production.hasExtension"] === true
          ? {
              targetRatePerHour: num("production.targetRatePerHour"),
              targetDate: a["production.targetDate"] ? str("production.targetDate") : undefined,
            }
          : undefined,
    },
    electricity: {
      bill,
      powerPenaltyMonthly:
        a["electricity.hasPowerPenalty"] === true
          ? num("electricity.powerPenaltyMonthly")
          : undefined,
    },
    generator:
      a["generator.has"] === true
        ? {
            fuel:
              a["generator.fuelMode"] === "amount"
                ? { mode: "amount", amountPerMonth: num("generator.amountPerMonth") }
                : {
                    mode: "liters",
                    litersPerMonth: num("generator.litersPerMonth"),
                    pricePerLiter: num("generator.pricePerLiter"),
                  },
            maintenancePerYear: opt("generator.maintenancePerYear") ?? 0,
          }
        : undefined,
    outages: {
      frequency: { count: frequency.count, per: frequency.per },
      averageDurationMin: num("outages.durationMin"),
      productionStoppedShare: pctToBp(num("outages.stoppedSharePct")),
      catchUpShare: pctToBp(num("outages.catchUpPct")),
    },
    hiddenCosts: {
      idleStaff:
        a["hidden.hasIdleStaff"] === true
          ? {
              headcount: num("hidden.headcount"),
              hourlyCost: num("hidden.hourlyCost"),
              nonRedeployedShare: pctToBp(num("hidden.nonRedeployedPct")),
            }
          : undefined,
      materialLoss:
        a["hidden.hasMaterialLoss"] === true
          ? {
              quantityPerOutage: num("hidden.quantityPerOutage"),
              unitCost: num("hidden.unitCost"),
              nonRecoverableShare: pctToBp(num("hidden.nonRecoverablePct")),
            }
          : undefined,
      customerPenaltyPerYear:
        a["hidden.hasCustomerPenalty"] === true ? num("hidden.customerPenaltyPerYear") : undefined,
    },
    project: {
      goals: (a["project.goals"] as string[] | undefined) ?? [],
      horizonYears: num("project.horizonYears"),
    },
  };
}
