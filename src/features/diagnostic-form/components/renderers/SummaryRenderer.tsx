"use client";

import * as stylex from "@stylexjs/stylex";
import { useMemo } from "react";
import { computeSnapshot, formatFcfa, formatNumber } from "@/lib/engine";
import { colors, radius } from "@/lib/tokens.stylex";
import { answersSchema } from "../../definition/schema";
import { toEngineInput } from "../../definition/to-engine-input";
import type { Answers, SummaryQuestion } from "../../definition/types";
import type { RendererProps } from "./types";

const styles = stylex.create({
  wrap: { display: "grid", gap: "1rem", maxWidth: "40rem", width: "100%" },
  list: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderStyle: "solid",
    borderWidth: "1px",
    display: "grid",
    overflow: "hidden",
  },
  row: {
    alignItems: "baseline",
    borderBottomColor: colors.border,
    borderBottomStyle: "solid",
    borderBottomWidth: "1px",
    display: "flex",
    gap: "1rem",
    justifyContent: "space-between",
    paddingBlock: "0.75rem",
    paddingInline: "1rem",
  },
  label: { color: colors.mutedForeground, fontSize: "0.95rem" },
  hidden: { color: colors.mutedForeground, fontSize: "0.8rem", marginLeft: "0.35rem" },
  amount: {
    fontVariantNumeric: "tabular-nums",
    fontWeight: 600,
    textAlign: "right",
    whiteSpace: "nowrap",
  },
  total: {
    backgroundColor: `color-mix(in oklab, ${colors.primary} 8%, ${colors.card})`,
    borderBottomWidth: 0,
    fontSize: "1.1rem",
  },
  totalLabel: { color: colors.foreground, fontWeight: 700 },
  note: { color: colors.mutedForeground, fontSize: "0.85rem", lineHeight: 1.5 },
  warning: {
    backgroundColor: `color-mix(in oklab, ${colors.accent} 18%, ${colors.card})`,
    borderRadius: radius.md,
    fontSize: "0.85rem",
    paddingBlock: "0.5rem",
    paddingInline: "0.75rem",
  },
  error: { color: colors.destructive, fontSize: "0.9rem" },
});

/**
 * Récapitulatif avant soumission : réutilise le moteur côté client sur les réponses déjà saisies.
 * Aucun scénario n'est montré ici : le rapport garde la primeur des résultats.
 */
export function SummaryRenderer({
  answers,
}: RendererProps<SummaryQuestion, never> & { answers: Answers }) {
  const preview = useMemo(():
    { error: string[] } | { snapshot: ReturnType<typeof computeSnapshot> } => {
    const parsed = answersSchema.safeParse({ ...answers, "contact.email": "preview@example.com" });
    if (!parsed.success)
      return { error: parsed.error.issues.map((i) => i.path.join(".")).slice(0, 3) };
    return { snapshot: computeSnapshot(toEngineInput(parsed.data)) };
  }, [answers]);

  if ("error" in preview) {
    return (
      <p {...stylex.props(styles.error)}>
        Certaines réponses manquent ou sont invalides ({preview.error.join(", ")}). Revenez en
        arrière pour les compléter.
      </p>
    );
  }

  const { baseline } = preview.snapshot;
  const items = baseline.items.filter((i) => i.applicable);
  return (
    <div {...stylex.props(styles.wrap)}>
      <div {...stylex.props(styles.list)}>
        {items.map((item) => (
          <div key={item.key} {...stylex.props(styles.row)}>
            <span {...stylex.props(styles.label)}>
              {item.label}
              {item.category === "hidden" ? (
                <span {...stylex.props(styles.hidden)}>(coût caché)</span>
              ) : null}
            </span>
            <span {...stylex.props(styles.amount)}>{formatFcfa(item.amount)}</span>
          </div>
        ))}
        <div {...stylex.props(styles.row, styles.total)}>
          <span {...stylex.props(styles.totalLabel)}>Coût annuel estimé de l&apos;instabilité</span>
          <span {...stylex.props(styles.amount)}>{formatFcfa(baseline.total)}</span>
        </div>
      </div>
      <p {...stylex.props(styles.note)}>
        Soit {formatNumber(baseline.outagesPerYear)} coupures et{" "}
        {formatNumber(baseline.outageHoursPerYear, 0)} heures d&apos;arrêt par an. Le rapport
        détaille chaque poste, compare trois scénarios solaires et recommande le plus rentable.
      </p>
      {baseline.warnings.map((w) => (
        <p key={w.code} {...stylex.props(styles.warning)}>
          {w.message}
        </p>
      ))}
    </div>
  );
}
