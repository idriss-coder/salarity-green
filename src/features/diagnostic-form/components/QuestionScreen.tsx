"use client";

import * as stylex from "@stylexjs/stylex";
import { motion } from "motion/react";
import { ArrowRight, Check, CornerDownLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { colors } from "@/lib/tokens.stylex";
import type { Answers } from "../definition/types";
import type { Step } from "../engine/reducer";
import { autoAdvances, QuestionRenderer } from "./registry";

const styles = stylex.create({
  screen: { display: "grid", gap: "1.75rem", maxWidth: "44rem", width: "100%" },
  eyebrow: {
    alignItems: "center",
    color: colors.primary,
    display: "flex",
    fontSize: "0.85rem",
    fontWeight: 700,
    gap: "0.5rem",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  eyebrowIndex: { alignItems: "center", display: "inline-flex", gap: "0.25rem" },
  intro: { color: colors.mutedForeground, fontSize: "1rem", marginTop: "-1rem" },
  title: {
    fontFamily: "var(--font-display)",
    fontSize: "clamp(1.5rem, 3.4vw, 2.2rem)",
    fontWeight: 700,
    lineHeight: 1.2,
  },
  description: {
    color: colors.mutedForeground,
    fontSize: "1.05rem",
    lineHeight: 1.55,
    marginTop: "0.5rem",
  },
  optional: {
    color: colors.mutedForeground,
    fontSize: "0.85rem",
    fontWeight: 400,
    marginLeft: "0.5rem",
  },
  error: { color: colors.destructive, fontSize: "0.95rem", fontWeight: 600 },
  actions: { alignItems: "center", display: "flex", flexWrap: "wrap", gap: "0.9rem" },
  hint: {
    alignItems: "center",
    color: colors.mutedForeground,
    display: { default: "inline-flex", "@media (max-width: 640px)": "none" },
    fontSize: "0.8rem",
    gap: "0.3rem",
  },
});

interface QuestionScreenProps {
  step: Step;
  index: number;
  answers: Answers;
  value: unknown;
  error?: string;
  isLast: boolean;
  submitting: boolean;
  onChange: (value: unknown) => void;
  onSubmit: () => void;
}

/** Un écran = une question : numéro, titre, aide, renderer, bouton OK. L'animation d'entrée/sortie est portée par le parent. */
export function QuestionScreen({
  step,
  index,
  answers,
  value,
  error,
  isLast,
  submitting,
  onChange,
  onSubmit,
}: QuestionScreenProps) {
  const { question, section, isSectionStart } = step;
  const showOk = !autoAdvances(question);
  const isOptional = question.required === false;

  return (
    <section {...stylex.props(styles.screen)}>
      <p {...stylex.props(styles.eyebrow)}>
        <span {...stylex.props(styles.eyebrowIndex)}>
          {index + 1} <ArrowRight size={14} aria-hidden />
        </span>
        <span>{section.title}</span>
      </p>
      {isSectionStart && section.intro ? (
        <p {...stylex.props(styles.intro)}>{section.intro}</p>
      ) : null}
      <div>
        <h1 {...stylex.props(styles.title)}>
          {question.title}
          {isOptional ? <span {...stylex.props(styles.optional)}>(facultatif)</span> : null}
        </h1>
        {question.description ? (
          <p {...stylex.props(styles.description)}>{question.description}</p>
        ) : null}
      </div>

      <QuestionRenderer
        question={question}
        value={value}
        answers={answers}
        onChange={onChange}
        onSubmit={onSubmit}
        error={error}
        autoFocus
      />

      {error ? (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          role="alert"
          {...stylex.props(styles.error)}
        >
          {error}
        </motion.p>
      ) : null}

      {showOk ? (
        <div {...stylex.props(styles.actions)}>
          <Button size="lg" onClick={onSubmit} disabled={submitting}>
            {isLast ? (submitting ? "Génération du rapport…" : "Générer mon rapport") : "OK"}
            {!isLast ? <Check size={18} aria-hidden /> : null}
          </Button>
          <span {...stylex.props(styles.hint)}>
            appuyez sur <strong>Entrée</strong> <CornerDownLeft size={12} aria-hidden />
          </span>
        </div>
      ) : null}
    </section>
  );
}
