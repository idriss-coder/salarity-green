"use client";

import * as stylex from "@stylexjs/stylex";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { colors, radius } from "@/lib/tokens.stylex";

const styles = stylex.create({
  card: {
    alignItems: "center",
    backgroundColor: {
      default: colors.card,
      ":hover": `color-mix(in oklab, ${colors.primary} 6%, ${colors.card})`,
    },
    borderColor: {
      default: `color-mix(in oklab, ${colors.primary} 25%, transparent)`,
      ":hover": colors.primary,
    },
    borderRadius: radius.lg,
    borderStyle: "solid",
    borderWidth: "1.5px",
    color: colors.foreground,
    cursor: "pointer",
    display: "flex",
    fontFamily: "inherit",
    fontSize: "1.05rem",
    gap: "0.9rem",
    outline: {
      default: "none",
      ":focus-visible": `3px solid color-mix(in oklab, ${colors.ring} 60%, transparent)`,
    },
    outlineOffset: "2px",
    paddingBlock: "0.85rem",
    paddingInline: "1rem",
    textAlign: "left",
    transitionDuration: "120ms",
    transitionProperty: "background-color, border-color, box-shadow",
    width: "100%",
  },
  selected: {
    backgroundColor: `color-mix(in oklab, ${colors.primary} 10%, ${colors.card})`,
    borderColor: colors.primary,
    boxShadow: `0 0 0 1px ${colors.primary}`,
  },
  key: {
    alignItems: "center",
    backgroundColor: { default: colors.background, ":is([data-selected=true] *)": colors.primary },
    borderColor: `color-mix(in oklab, ${colors.primary} 35%, transparent)`,
    borderRadius: radius.sm,
    borderStyle: "solid",
    borderWidth: "1px",
    color: { default: colors.primary, ":is([data-selected=true] *)": colors.primaryForeground },
    display: "inline-flex",
    flexShrink: 0,
    fontSize: "0.75rem",
    fontWeight: 700,
    height: "1.6rem",
    justifyContent: "center",
    minWidth: "1.6rem",
    paddingInline: "0.35rem",
  },
  body: { display: "flex", flexDirection: "column", gap: "0.15rem" },
  description: { color: colors.mutedForeground, fontSize: "0.85rem" },
});

interface OptionCardProps {
  label: ReactNode;
  description?: string;
  /** Raccourci clavier affiché (A, B, O, N…). */
  hotkey?: string;
  selected: boolean;
  onSelect: () => void;
}

/** Carte d'option cliquable, avec raccourci clavier visible — brique des choix, oui/non et listes. */
export function OptionCard({ label, description, hotkey, selected, onSelect }: OptionCardProps) {
  return (
    <motion.button
      type="button"
      role="option"
      aria-selected={selected}
      data-selected={selected}
      onClick={onSelect}
      whileTap={{ scale: 0.985 }}
      {...stylex.props(styles.card, selected && styles.selected)}
    >
      {hotkey ? <span {...stylex.props(styles.key)}>{hotkey}</span> : null}
      <span {...stylex.props(styles.body)}>
        <span>{label}</span>
        {description ? <span {...stylex.props(styles.description)}>{description}</span> : null}
      </span>
    </motion.button>
  );
}
