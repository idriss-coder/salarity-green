"use client";

import * as stylex from "@stylexjs/stylex";
import { useMemo } from "react";
import { colors, radius } from "@/lib/tokens.stylex";
import type { MonthAmount, MonthTableQuestion } from "../../definition/types";
import { formatIntegerInput, parseNumberInput } from "./number-format";
import type { RendererProps } from "./types";

const styles = stylex.create({
  grid: {
    display: "grid",
    gap: "0.5rem",
    gridTemplateColumns: {
      default: "repeat(2, minmax(0, 1fr))",
      "@media (max-width: 640px)": "1fr",
    },
    maxWidth: "40rem",
    width: "100%",
  },
  row: { alignItems: "center", display: "flex", gap: "0.6rem" },
  label: {
    color: colors.mutedForeground,
    fontSize: "0.9rem",
    textTransform: "capitalize",
    width: "6.5rem",
  },
  input: {
    backgroundColor: colors.card,
    borderColor: { default: colors.input, ":focus": colors.primary },
    borderRadius: radius.md,
    borderStyle: "solid",
    borderWidth: "1px",
    color: colors.foreground,
    flex: 1,
    fontFamily: "inherit",
    fontSize: "1rem",
    minWidth: 0,
    outline: "none",
    paddingBlock: "0.5rem",
    paddingInline: "0.75rem",
    textAlign: "right",
  },
  unit: { color: colors.mutedForeground, fontSize: "0.8rem", width: "2.6rem" },
});

/** Les 12 derniers mois glissants, du plus récent au plus ancien. */
export function lastTwelveMonths(now = new Date()): string[] {
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 1 - i, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
}

function monthLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
}

export function MonthTableRenderer({
  value,
  onChange,
  onSubmit,
  autoFocus,
}: RendererProps<MonthTableQuestion, MonthAmount[]>) {
  const months = useMemo(() => lastTwelveMonths(), []);
  const rows: MonthAmount[] =
    value?.length === 12 ? value : months.map((month) => ({ month, amount: null }));

  const update = (index: number, raw: string) => {
    const parsed = parseNumberInput(raw);
    const next = rows.map((r, i) =>
      i === index ? { ...r, amount: parsed === undefined ? null : Math.round(parsed) } : r,
    );
    onChange(next);
  };

  return (
    <div {...stylex.props(styles.grid)}>
      {rows.map((row, i) => (
        <label key={row.month} {...stylex.props(styles.row)}>
          <span {...stylex.props(styles.label)}>{monthLabel(row.month)}</span>
          <input
            type="text"
            inputMode="numeric"
            placeholder="—"
            value={formatIntegerInput(row.amount ?? undefined)}
            onChange={(e) => update(i, e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSubmit()}
            autoFocus={autoFocus && i === 0}
            {...stylex.props(styles.input)}
          />
          <span {...stylex.props(styles.unit)}>FCFA</span>
        </label>
      ))}
    </div>
  );
}
