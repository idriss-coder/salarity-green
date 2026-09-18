"use client";

import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import { colors, radius } from "@/lib/tokens.stylex";
import { BigInput } from "../primitives/BigInput";
import type { FrequencyQuestion, FrequencyValue } from "../../definition/types";
import { parseNumberInput } from "./number-format";
import type { RendererProps } from "./types";

const styles = stylex.create({
  wrap: { display: "grid", gap: "1rem", maxWidth: "36rem" },
  segmented: {
    display: "inline-flex",
    gap: "0.35rem",
    padding: "0.25rem",
    backgroundColor: colors.muted,
    borderRadius: radius.lg,
    width: "fit-content",
  },
  seg: {
    backgroundColor: { default: "transparent", ":is([data-active=true])": colors.card },
    borderRadius: radius.md,
    borderStyle: "none",
    boxShadow: { default: "none", ":is([data-active=true])": "0 1px 2px rgba(0,0,0,0.12)" },
    color: { default: colors.mutedForeground, ":is([data-active=true])": colors.foreground },
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: "0.95rem",
    fontWeight: 600,
    paddingBlock: "0.5rem",
    paddingInline: "0.9rem",
  },
});

const PERIODS: Array<{ value: FrequencyValue["per"]; label: string }> = [
  { value: "day", label: "par jour" },
  { value: "week", label: "par semaine" },
  { value: "month", label: "par mois" },
];

/** Fréquence des coupures : un nombre + une période (segmenté). */
export function FrequencyRenderer({
  value,
  onChange,
  onSubmit,
  error,
  autoFocus,
}: RendererProps<FrequencyQuestion, FrequencyValue>) {
  const per = value?.per ?? "day";
  const [text, setText] = useState(value?.count?.toString() ?? "");
  const update = (count: number | undefined, nextPer: FrequencyValue["per"]) =>
    onChange({ count: count as number, per: nextPer });

  return (
    <div {...stylex.props(styles.wrap)}>
      <BigInput
        type="text"
        inputMode="decimal"
        placeholder="1"
        suffix="coupure(s)"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          update(parseNumberInput(e.target.value), per);
        }}
        onKeyDown={(e) => e.key === "Enter" && onSubmit()}
        invalid={Boolean(error)}
        autoFocus={autoFocus}
      />
      <div role="radiogroup" {...stylex.props(styles.segmented)}>
        {PERIODS.map((p) => (
          <button
            key={p.value}
            type="button"
            role="radio"
            aria-checked={per === p.value}
            data-active={per === p.value}
            onClick={() => update(parseNumberInput(text), p.value)}
            {...stylex.props(styles.seg)}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
