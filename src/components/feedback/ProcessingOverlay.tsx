"use client";

import * as stylex from "@stylexjs/stylex";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { colors } from "@/lib/tokens.stylex";

/**
 * Voile plein écran pour une attente de quelques secondes (génération ou téléchargement du rapport) :
 * un anneau qui tourne et une phrase d'état qui change toute seule, pour montrer que ça avance.
 * Le dernier message reste affiché tant que l'attente dure.
 */

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const styles = stylex.create({
  veil: {
    alignItems: "center",
    backgroundColor: colors.primary,
    color: colors.primaryForeground,
    display: "flex",
    inset: 0,
    justifyContent: "center",
    overflow: "hidden",
    position: "fixed",
    zIndex: 60,
  },
  content: {
    alignItems: "center",
    display: "grid",
    gap: "1.75rem",
    justifyItems: "center",
    maxWidth: "36rem",
    paddingInline: "clamp(1.25rem, 6vw, 4rem)",
    textAlign: "center",
    width: "100%",
  },
  ring: { display: "block", height: "84px", width: "84px" },
  title: {
    fontFamily: "var(--font-display)",
    fontSize: "clamp(1.4rem, 3.4vw, 2.1rem)",
    fontWeight: 800,
    lineHeight: 1.15,
    margin: 0,
    textTransform: "uppercase",
  },
  status: {
    // Hauteur fixe : les phrases se remplacent sans faire sauter la mise en page.
    alignItems: "center",
    display: "flex",
    height: "3.2rem",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
    width: "100%",
  },
  statusText: {
    color: `color-mix(in oklab, ${colors.primaryForeground} 82%, transparent)`,
    fontSize: "1.05rem",
    lineHeight: 1.5,
    margin: 0,
    position: "absolute",
  },
  small: {
    color: `color-mix(in oklab, ${colors.primaryForeground} 55%, transparent)`,
    fontSize: "0.8rem",
    margin: 0,
  },
});

interface ProcessingOverlayProps {
  title: string;
  /** Phrases d'état, affichées dans l'ordre ; la dernière reste. */
  messages: readonly string[];
  /** Intervalle entre deux phrases. */
  intervalMs?: number;
  note?: string;
}

export function ProcessingOverlay({
  title,
  messages,
  intervalMs = 2000,
  note = "Ne fermez pas cette page.",
}: ProcessingOverlayProps) {
  const reduced = useReducedMotion() ?? false;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index >= messages.length - 1) return;
    const timer = window.setTimeout(() => setIndex((i) => i + 1), intervalMs);
    return () => window.clearTimeout(timer);
  }, [index, messages.length, intervalMs]);

  return (
    <motion.div
      role="status"
      aria-live="polite"
      aria-busy="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      {...stylex.props(styles.veil)}
    >
      <div {...stylex.props(styles.content)}>
        <Ring reduced={reduced} />
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5, ease: EASE_OUT }}
          {...stylex.props(styles.title)}
        >
          {title}
        </motion.h2>
        <div {...stylex.props(styles.status)}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={index}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: -14 }}
              transition={{ duration: 0.35, ease: EASE_OUT }}
              {...stylex.props(styles.statusText)}
            >
              {messages[index]}
            </motion.p>
          </AnimatePresence>
        </div>
        <p {...stylex.props(styles.small)}>{note}</p>
      </div>
    </motion.div>
  );
}

/** Anneau discret : un arc d'accent qui tourne sur une piste claire. */
function Ring({ reduced }: { reduced: boolean }) {
  return (
    <svg viewBox="0 0 84 84" fill="none" aria-hidden {...stylex.props(styles.ring)}>
      <circle cx="42" cy="42" r="34" stroke="currentColor" strokeOpacity="0.18" strokeWidth="4" />
      <motion.circle
        cx="42"
        cy="42"
        r="34"
        style={{ stroke: colors.accent, transformOrigin: "50% 50%" }}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="60 154"
        animate={reduced ? undefined : { rotate: 360 }}
        transition={{ duration: 1.4, ease: "linear", repeat: Infinity }}
      />
    </svg>
  );
}
