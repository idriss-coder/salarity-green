import { formatBp, formatFcfa, formatMillions, formatNumber, formatPayback } from "@/lib/engine";
import type { CostItem, Snapshot } from "@/lib/engine";

/**
 * View-model du rapport : tout le texte et toutes les cellules des 9 pages,
 * dérivés du snapshot. Aucune page ne calcule ni ne formate elle-même un chiffre.
 */

/** Fragment de phrase, en gras ou non (page 3 et page 2). */
export interface Segment {
  text: string;
  bold?: boolean;
}

export interface ReportMeta {
  companyName: string;
  generatedAt: Date;
}

export interface ReportViewModel {
  meta: ReportMeta;
  cover: { title: string; subtitle: string };
  why: { objective: Segment[]; scope: Segment[]; method: Segment[] };
  findings: { heading: string; bullets: Segment[][] };
  costChart: {
    title: string;
    subtitle: string;
    caption: string;
    bars: Array<{ label: string; amount: number }>;
  };
  costTable: {
    rows: Array<{
      label: string;
      formula: string;
      detail: string;
      amount: string;
      hidden: boolean;
    }>;
    totalLabel: string;
    total: string;
    footnotes: string[];
    warnings: string[];
  };
  scenarioTable: {
    baselineHeader: string;
    scenarioHeaders: string[];
    rows: Array<{ label: string; baseline: string; reductions: string[]; hidden: boolean }>;
    totalRow: { label: string; baseline: string; reductions: string[] };
    footnotes: string[];
  };
  roi: {
    chartTitle: string;
    chartSubtitle: string;
    horizonYears: number;
    series: Array<{ label: string; values: number[] }>;
    rows: Array<{
      label: string;
      investment: string;
      residual: string;
      savings: string;
      payback: string;
    }>;
  };
  recommendation: { heading: string; reasons: string[]; footer: string };
  commitments: Array<{ commitment: string; description: string; secures: string }>;
}

const b = (text: string): Segment => ({ text, bold: true });
const t = (text: string): Segment => ({ text });

function rateLabel(ratePerHour: number, unit: string): string {
  return `${formatNumber(ratePerHour)} ${unit}s/h`;
}

function reductionCell(bp: number): string {
  return bp === 0 ? "0" : `-${formatBp(bp)}`;
}

export function buildViewModel(
  snapshot: Snapshot,
  input: {
    companyName: string;
    unit: string;
    ratePerHour: number;
    marginPerUnit: number;
    generatedAt: Date;
  },
): ReportViewModel {
  const { baseline, scenarios, future, recommendation, horizonYears } = snapshot;
  const name = input.companyName.toUpperCase();
  const applicable = baseline.items.filter((i) => i.applicable);
  const hasHidden = applicable.some((i) => i.category === "hidden");
  const currentRate = rateLabel(input.ratePerHour, input.unit);
  const marginHypothesis = `Hypothèse de marge de ${formatFcfa(input.marginPerUnit)} par ${input.unit} pour le calcul des pertes de production`;

  const selected = scenarios.find((s) => s.key === recommendation.scenarioKey) ?? scenarios[0];
  const selectedIndex = scenarios.indexOf(selected) + 1;

  return {
    meta: { companyName: name, generatedAt: input.generatedAt },

    cover: {
      title: `ÉNERGIE : UN LEVIER DE COMPÉTITIVITÉ POUR ${name}`,
      subtitle: "Résultats de l'étude technico-économique et scénarios d'investissement",
    },

    why: {
      objective: [
        b("Objectif : "),
        t(`évaluer le coût réel de l'instabilité énergétique sur la rentabilité de ${name}.`),
      ],
      scope: future
        ? [
            b("Périmètre : "),
            t(
              `production actuelle (${currentRate}) et future extension (${rateLabel(future.targetRatePerHour, input.unit)}).`,
            ),
          ]
        : [b("Périmètre : "), t(`production actuelle (${currentRate}).`)],
      method: [
        b("Méthodologie : "),
        t("analyse des "),
        b("coûts visibles"),
        t(" et des "),
        b("coûts cachés"),
        t("."),
      ],
    },

    findings: {
      heading: `L'INSTABILITÉ DU RÉSEAU ÉLECTRIQUE CONSTITUE UN FREIN MAJEUR À LA COMPÉTITIVITÉ DE ${name}.`,
      bullets: buildFindings(snapshot, input, name),
    },

    costChart: {
      title: `Coût annuel de l'instabilité énergétique – ${name}`,
      subtitle: `Résultats de l'étude (hypothèse : marge de ${formatFcfa(input.marginPerUnit)} par ${input.unit}).`,
      caption: `Hypothèse de marge minimisée à ${formatFcfa(input.marginPerUnit)} par ${input.unit}`,
      bars: applicable.map((i) => ({ label: i.label, amount: i.amount })),
    },

    costTable: {
      rows: applicable.map((i) => ({
        label: i.label + (i.category === "hidden" ? "*" : ""),
        formula: i.formulaLabel,
        detail: i.formulaDetail,
        amount: formatFcfa(i.amount),
        hidden: i.category === "hidden",
      })),
      totalLabel: "Total Consommation",
      total: formatFcfa(baseline.total),
      footnotes: hasHidden ? ["* : coûts cachés", marginHypothesis] : [marginHypothesis],
      warnings: baseline.warnings.map((w) => w.message),
    },

    scenarioTable: {
      baselineHeader: `Dépenses Annuelles Existant (${currentRate})`,
      scenarioHeaders: scenarios.map((s) => s.label),
      rows: applicable.map((i) => ({
        label: i.label + (i.category === "hidden" ? "*" : ""),
        baseline: formatFcfa(i.amount),
        reductions: scenarios.map((s) =>
          reductionCell(s.impacts.find((x) => x.key === i.key)?.reductionBp ?? 0),
        ),
        hidden: i.category === "hidden",
      })),
      totalRow: {
        label: "Total Consommation",
        baseline: formatFcfa(baseline.total),
        reductions: scenarios.map((s) => `-${formatBp(s.totalReductionBp, 1)}`),
      },
      footnotes: hasHidden ? ["* : coûts cachés", marginHypothesis] : [marginHypothesis],
    },

    roi: {
      chartTitle: `Coût cumulé des scénarios énergétiques – ${name}`,
      chartSubtitle: `Comparaison sur ${horizonYears} ans des coûts cumulés (investissement initial + coûts d'exploitation).`,
      horizonYears,
      series: [
        { label: "Situation actuelle", values: snapshot.baselineCumulative },
        ...scenarios.map((s) => ({
          label: `${s.label} (${formatMillions(s.investment, 0, false)})`,
          values: s.cumulative,
        })),
      ],
      rows: [
        {
          label: "Situation actuelle",
          investment: "------",
          residual: formatMillions(baseline.total),
          savings: "------",
          payback: "------",
        },
        ...scenarios.map((s) => ({
          label: s.label,
          investment: formatMillions(s.investment, 0),
          residual: formatMillions(s.residualTotal),
          savings: formatMillions(s.savingsPerYear, 1),
          payback:
            s.paybackYearsHundredths === null ? "—" : formatPayback(s.paybackYearsHundredths),
        })),
      ],
    },

    recommendation: {
      heading: `Pourquoi nous recommandons la proposition ${selectedIndex} : ${selected.label}`,
      reasons: recommendation.reasons,
      footer: `Notre recommandation est fondée sur la rentabilité globale du projet et sur sa capacité à accompagner durablement la croissance de ${name}.`,
    },

    commitments: COMMITMENTS.map((c) => ({
      commitment: c.commitment,
      description: c.description.replace("{name}", name),
      secures: c.secures.replace("{name}", name),
    })),
  };
}

function buildFindings(
  snapshot: Snapshot,
  input: { unit: string; ratePerHour: number },
  name: string,
): Segment[][] {
  const { baseline, future } = snapshot;
  const unit = input.unit;
  const item = (key: string): CostItem | undefined =>
    baseline.items.find((i) => i.key === key && i.applicable);
  const bullets: Segment[][] = [];

  bullets.push([
    b(`${formatMillions(baseline.total, 0, false, true)} FCFA/an`),
    t(" de "),
    b("coûts directs"),
    t(" et "),
    b("indirects"),
    t(" liés à l'alimentation électrique ont été identifiés."),
  ]);

  bullets.push([
    b(`${formatNumber(baseline.outagesPerYear)} coupures`),
    t(" par an, entraînant des interruptions récurrentes de la production."),
  ]);

  const productionLoss = item("productionLoss");
  if (productionLoss && baseline.unitsLostPerYear > 0) {
    const lost = [
      b(`${formatNumber(baseline.unitsLostPerYear)} ${unit}s`),
      t(" de production potentiellement perdus chaque année, soit un manque à gagner estimé à "),
    ];
    if (future) {
      lost.push(
        b(`${formatMillions(future.productionLossPerYear, 0, false)} FCFA/an`),
        t(" pour la cible de "),
        b(rateLabel(future.targetRatePerHour, unit)),
        t("."),
      );
    } else {
      lost.push(b(`${formatMillions(productionLoss.amount, 1, false)} FCFA/an`), t("."));
    }
    bullets.push(lost);
  }

  const diesel = item("diesel");
  const maintenance = item("generatorMaintenance");
  if (diesel) {
    const parts = [
      t("Le groupe électrogène représente "),
      b(`${formatMillions(diesel.amount, 1, false)} FCFA/an`),
      t(" de carburant"),
    ];
    if (maintenance && maintenance.amount > 0)
      parts.push(
        t(" et "),
        b(`${formatMillions(maintenance.amount, 1, false)} FCFA/an`),
        t(" de maintenance"),
      );
    parts.push(t(", des dépenses qui augmentent avec chaque interruption du réseau."));
    bullets.push(parts);
  }

  if (future) {
    const when = future.targetDate ? ` (${future.targetDate})` : "";
    bullets.push([
      t("Le passage prévu de "),
      b(`${rateLabel(input.ratePerHour, unit)} à ${rateLabel(future.targetRatePerHour, unit)}`),
      t(`${when} `),
      b("renforcera"),
      t(" encore l'impact économique de chaque "),
      b("interruption de production"),
      t("."),
    ]);
  } else if (baseline.totalHidden > 0) {
    bullets.push([
      t("Les "),
      b("coûts cachés"),
      t(" (pertes de production, personnel immobilisé, matières) représentent "),
      b(formatBp(Math.round((baseline.totalHidden / baseline.total) * 10_000), 0)),
      t(` des coûts identifiés pour ${name}.`),
    ]);
  }

  return bullets.slice(0, 5);
}

/** Page 12 : engagements Solarity (contenu fixe du modèle). */
export const COMMITMENTS = [
  {
    commitment: "Équipements de référence (Garantie 2 ans ext à 5 ans)",
    description:
      "Solution basée sur des équipements Huawei, acteur mondial majeur des solutions d'énergie solaire et de stockage",
    secures: "Fiabilité et pérennité technologique",
  },
  {
    commitment: "Autonomie des équipes",
    description: "Formation des techniciens {name} avant réception et mise en exploitation",
    secures: "Capacité d'intervention de premier niveau et réduction des délais",
  },
  {
    commitment: "Supervision continue",
    description: "Monitoring des performances et suivi à distance via une plateforme dédiée",
    secures: "Détection rapide des anomalies et suivi de la production énergétique",
  },
  {
    commitment: "Évolutivité",
    description:
      "Architecture conçue pour permettre l'extension du système en fonction de l'évolution des besoins de production",
    secures: "Protection de l'investissement face à la croissance",
  },
  {
    commitment: "Disponibilité des pièces",
    description:
      "Accès local aux équipements et pièces de rechange via le réseau de partenaires/distributeurs",
    secures: "Réduction du risque d'immobilisation prolongée",
  },
] as const;
