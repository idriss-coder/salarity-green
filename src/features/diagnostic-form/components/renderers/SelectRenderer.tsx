"use client";

import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import { BigInput } from "../primitives/BigInput";
import { OptionCard } from "../primitives/OptionCard";
import type { SelectQuestion } from "../../definition/types";
import { ChoiceRenderer } from "./ChoiceRenderer";
import { useHotkeys } from "./useHotkeys";
import type { RendererProps } from "./types";

const styles = stylex.create({
  list: { display: "grid", gap: "0.6rem", maxWidth: "34rem", width: "100%" },
  custom: { marginTop: "0.5rem" },
});

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/** Liste avec valeur libre possible (« Autre »). Sans saisie libre, se comporte comme un choix unique. */
export function SelectRenderer(props: RendererProps<SelectQuestion, string>) {
  const { question, value, onChange, onSubmit, error, autoFocus } = props;
  if (!question.allowCustom) return <ChoiceRenderer {...props} />;

  const known = question.options.some((o) => o.value === value);
  const [customMode, setCustomMode] = useState(Boolean(value) && !known);
  const select = (v: string) => {
    setCustomMode(false);
    onChange(v);
    window.setTimeout(onSubmit, 220);
  };
  useHotkeys(
    Object.fromEntries(question.options.map((o, i) => [LETTERS[i], () => select(o.value)])),
  );

  return (
    <div {...stylex.props(styles.list)}>
      {question.options.map((option, i) => (
        <OptionCard
          key={option.value}
          hotkey={LETTERS[i]}
          label={option.label}
          selected={!customMode && value === option.value}
          onSelect={() => select(option.value)}
        />
      ))}
      <OptionCard
        hotkey="…"
        label="Autre"
        description="Saisir une autre valeur"
        selected={customMode}
        onSelect={() => {
          setCustomMode(true);
          onChange("");
        }}
      />
      {customMode ? (
        <div {...stylex.props(styles.custom)}>
          <BigInput
            placeholder="Précisez"
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSubmit()}
            invalid={Boolean(error)}
            autoFocus={autoFocus}
          />
        </div>
      ) : null}
    </div>
  );
}
