"use client";

import * as stylex from "@stylexjs/stylex";
import { motion } from "motion/react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { ReactNode } from "react";
import { Brand } from "@/components/layout/Brand";
import { Button } from "@/components/ui/button";
import { colors } from "@/lib/tokens.stylex";

const styles = stylex.create({
  shell: { display: "flex", flexDirection: "column", minHeight: "100dvh", position: "relative" },
  progressTrack: {
    backgroundColor: `color-mix(in oklab, ${colors.primary} 12%, transparent)`,
    height: "4px",
    left: 0,
    position: "fixed",
    right: 0,
    top: 0,
    zIndex: 10,
  },
  progressBar: { backgroundColor: colors.primary, height: "100%", transformOrigin: "left" },
  header: {
    alignItems: "center",
    display: "flex",
    justifyContent: "space-between",
    paddingBlock: "1.25rem",
    paddingInline: "clamp(1rem, 4vw, 3rem)",
  },
  counter: {
    color: colors.mutedForeground,
    fontSize: "0.85rem",
    fontVariantNumeric: "tabular-nums",
  },
  main: {
    alignItems: "center",
    display: "flex",
    flex: 1,
    justifyContent: "center",
    paddingBlock: "1rem 6rem",
    paddingInline: "clamp(1rem, 6vw, 5rem)",
    position: "relative",
    overflowX: "hidden",
  },
  nav: {
    bottom: "1.25rem",
    display: "flex",
    gap: "0.35rem",
    position: "fixed",
    right: "clamp(1rem, 4vw, 3rem)",
    zIndex: 10,
  },
  footer: {
    bottom: "1.6rem",
    color: colors.mutedForeground,
    fontSize: "0.75rem",
    left: "clamp(1rem, 4vw, 3rem)",
    position: "fixed",
  },
});

interface FormShellProps {
  progress: number;
  index: number;
  total: number;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  children: ReactNode;
}

/** Cadre plein écran du parcours : barre de progression, en-tête, zone de question centrée, navigation haut/bas. */
export function FormShell({
  progress,
  index,
  total,
  canPrev,
  canNext,
  onPrev,
  onNext,
  children,
}: FormShellProps) {
  return (
    <div {...stylex.props(styles.shell)}>
      <div
        {...stylex.props(styles.progressTrack)}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
      >
        <motion.div
          animate={{ scaleX: Math.max(0.02, progress) }}
          transition={{ type: "spring", stiffness: 120, damping: 24 }}
          {...stylex.props(styles.progressBar)}
        />
      </div>
      <header {...stylex.props(styles.header)}>
        <Brand size={32} />
        <span {...stylex.props(styles.counter)}>
          {index + 1} / {total}
        </span>
      </header>
      <main {...stylex.props(styles.main)}>{children}</main>
      <nav aria-label="Navigation entre les questions" {...stylex.props(styles.nav)}>
        <Button
          variant="outline"
          size="icon"
          aria-label="Question précédente"
          disabled={!canPrev}
          onClick={onPrev}
        >
          <ChevronUp size={18} />
        </Button>
        <Button
          variant="outline"
          size="icon"
          aria-label="Question suivante"
          disabled={!canNext}
          onClick={onNext}
        >
          <ChevronDown size={18} />
        </Button>
      </nav>
      <p {...stylex.props(styles.footer)}>Vos réponses sont enregistrées sur cet appareil.</p>
    </div>
  );
}
