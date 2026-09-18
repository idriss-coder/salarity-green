"use client";

import { useState } from "react";
import { BigInput } from "../primitives/BigInput";
import type { CurrencyQuestion, NumberQuestion } from "../../definition/types";
import { formatIntegerInput, parseNumberInput } from "./number-format";
import type { RendererProps } from "./types";

/** Nombres et montants : clavier numérique, unité dans le champ, groupement des milliers pour les montants. */
export function NumberRenderer({
  question,
  value,
  onChange,
  onSubmit,
  error,
  autoFocus,
}: RendererProps<NumberQuestion | CurrencyQuestion, number>) {
  const isCurrency = question.type === "currency";
  const [text, setText] = useState(() =>
    isCurrency ? formatIntegerInput(value) : (value?.toString() ?? ""),
  );
  const suffix = isCurrency ? `FCFA ${question.per ?? ""}`.trim() : question.unit;

  return (
    <BigInput
      type="text"
      inputMode="decimal"
      placeholder={"placeholder" in question ? question.placeholder : "0"}
      suffix={suffix}
      value={text}
      onChange={(e) => {
        const parsed = parseNumberInput(e.target.value);
        if (isCurrency) {
          const rounded = parsed === undefined ? undefined : Math.round(parsed);
          setText(formatIntegerInput(rounded));
          onChange(rounded as number);
        } else {
          setText(e.target.value);
          onChange(parsed as number);
        }
      }}
      onKeyDown={(e) => e.key === "Enter" && onSubmit()}
      invalid={Boolean(error)}
      autoFocus={autoFocus}
    />
  );
}
