"use client";

import * as stylex from "@stylexjs/stylex";
import { OptionCard } from "../primitives/OptionCard";
import type { ChoiceQuestion, MultiChoiceQuestion, SelectQuestion } from "../../definition/types";
import { useHotkeys } from "./useHotkeys";
import type { RendererProps } from "./types";

const styles = stylex.create({
  list: { display: "grid", gap: "0.6rem", maxWidth: "34rem", width: "100%" },
});

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/** Choix unique (choice, select sans saisie libre) : sélectionner avance automatiquement. */
export function ChoiceRenderer({
  question,
  value,
  onChange,
  onSubmit,
}: RendererProps<ChoiceQuestion | SelectQuestion, string>) {
  const select = (v: string) => {
    onChange(v);
    // Laisse le temps de voir la sélection avant de passer à l'écran suivant.
    window.setTimeout(onSubmit, 220);
  };
  useHotkeys(
    Object.fromEntries(question.options.map((o, i) => [LETTERS[i], () => select(o.value)])),
  );

  return (
    <div role="listbox" {...stylex.props(styles.list)}>
      {question.options.map((option, i) => (
        <OptionCard
          key={option.value}
          hotkey={LETTERS[i]}
          label={option.label}
          description={option.description}
          selected={value === option.value}
          onSelect={() => select(option.value)}
        />
      ))}
    </div>
  );
}

/** Choix multiple : les cartes se cochent, le bouton OK valide. */
export function MultiChoiceRenderer({
  question,
  value,
  onChange,
}: RendererProps<MultiChoiceQuestion, string[]>) {
  const selected = value ?? [];
  const toggle = (v: string) =>
    onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]);
  useHotkeys(
    Object.fromEntries(question.options.map((o, i) => [LETTERS[i], () => toggle(o.value)])),
  );

  return (
    <div role="listbox" aria-multiselectable {...stylex.props(styles.list)}>
      {question.options.map((option, i) => (
        <OptionCard
          key={option.value}
          hotkey={LETTERS[i]}
          label={option.label}
          description={option.description}
          selected={selected.includes(option.value)}
          onSelect={() => toggle(option.value)}
        />
      ))}
    </div>
  );
}
