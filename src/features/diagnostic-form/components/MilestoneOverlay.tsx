"use client";

import * as stylex from "@stylexjs/stylex";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { useCallback, useEffect, useRef } from "react";
import { formatFcfa, formatNumber } from "@/lib/engine";
import { colors } from "@/lib/tokens.stylex";
import type { Milestone, MilestoneFigure } from "../engine/milestones";

/**
 * Écran de jalon : un voile vert plein écran qui monte, reformule ce qui vient d'être saisi en un
 * chiffre animé, puis se retire tout seul (ou sur Entrée / clic). Pendant qu'il est affiché, le clavier
 * est intercepté pour que rien ne parte vers la question en dessous.
 */

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const EASE_WIPE = [0.76, 0, 0.24, 1] as const;

const styles = stylex.create({
  veil: {
    alignItems: "center",
    backgroundColor: colors.primary,
    color: colors.primaryForeground,
    cursor: "pointer",
    display: "flex",
    inset: 0,
    justifyContent: "center",
    overflow: "hidden",
    position: "fixed",
    userSelect: "none",
    zIndex: 50,
  },
  glow: {
    backgroundImage: `radial-gradient(closest-side, color-mix(in oklab, ${colors.accent} 55%, transparent), transparent)`,
    borderRadius: "50%",
    height: "70vmax",
    left: "50%",
    pointerEvents: "none",
    position: "absolute",
    top: "50%",
    width: "70vmax",
  },
  content: {
    display: "grid",
    gap: "1.5rem",
    maxWidth: "52rem",
    paddingInline: "clamp(1.25rem, 6vw, 4rem)",
    position: "relative",
    width: "100%",
  },
  eyebrow: {
    alignItems: "center",
    color: colors.accent,
    display: "flex",
    fontSize: "0.8rem",
    fontWeight: 700,
    gap: "0.6rem",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
  },
  title: {
    fontFamily: "var(--font-display)",
    fontSize: "clamp(1.7rem, 4.2vw, 2.9rem)",
    fontWeight: 800,
    lineHeight: 1.12,
    margin: 0,
  },
  word: { display: "inline-block", overflow: "hidden", verticalAlign: "bottom" },
  wordInner: { display: "inline-block", paddingRight: "0.28em" },
  figure: {
    fontFamily: "var(--font-display)",
    fontSize: "clamp(2.4rem, 8.5vw, 6.2rem)",
    fontVariantNumeric: "tabular-nums",
    fontWeight: 800,
    letterSpacing: "-0.02em",
    lineHeight: 1,
    whiteSpace: "nowrap",
  },
  figureSmall: { fontSize: "clamp(2rem, 6.5vw, 4.6rem)" },
  figureLabel: {
    color: `color-mix(in oklab, ${colors.primaryForeground} 72%, transparent)`,
    fontSize: "1rem",
    marginTop: "0.5rem",
  },
  pair: {
    display: "grid",
    gap: "1.5rem 3rem",
    gridTemplateColumns: { default: "repeat(2, max-content)", "@media (max-width: 640px)": "1fr" },
  },
  detail: {
    color: `color-mix(in oklab, ${colors.primaryForeground} 78%, transparent)`,
    fontSize: "1.05rem",
    lineHeight: 1.55,
    margin: 0,
    maxWidth: "36rem",
  },
  ringWrap: { alignItems: "center", display: "flex", gap: "1.25rem" },
  ringPercent: {
    fontFamily: "var(--font-display)",
    fontSize: "1.1rem",
    fontVariantNumeric: "tabular-nums",
    fontWeight: 800,
  },
  bottom: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
  },
  timer: {
    backgroundColor: colors.accent,
    height: "3px",
    transformOrigin: "left",
    width: "100%",
  },
  hint: {
    color: `color-mix(in oklab, ${colors.primaryForeground} 55%, transparent)`,
    display: { default: "block", "@media (max-width: 640px)": "none" },
    fontSize: "0.75rem",
    paddingBlock: "0.75rem",
    paddingInline: "clamp(1rem, 4vw, 3rem)",
    textAlign: "right",
  },
});

interface MilestoneOverlayProps {
  milestone: Milestone;
  onDone: () => void;
}

export function MilestoneOverlay({ milestone, onDone }: MilestoneOverlayProps) {
  const reduced = useReducedMotion() ?? false;
  const { base } = milestone;

  // `onDone` ne doit être appelé qu'une fois : le composant reste monté pendant son animation de sortie
  // (AnimatePresence) et le minuteur pourrait sinon retomber sur un clic déjà traité.
  const latestOnDone = useRef(onDone);
  latestOnDone.current = onDone;
  const doneOnce = useRef(false);
  const finish = useCallback(() => {
    if (doneOnce.current) return;
    doneOnce.current = true;
    latestOnDone.current();
  }, []);

  // Fermeture automatique, ou anticipée par le clavier. Capture au niveau fenêtre : les raccourcis des
  // renderers (O / N, lettres) et la navigation ↑ ↓ ne doivent pas atteindre la question en dessous.
  useEffect(() => {
    (document.activeElement as HTMLElement | null)?.blur?.();
    const timer = window.setTimeout(finish, base.durationMs);
    function onKey(event: KeyboardEvent) {
      event.stopPropagation();
      if (["Enter", " ", "Escape", "ArrowDown"].includes(event.key)) {
        event.preventDefault();
        finish();
      }
    }
    window.addEventListener("keydown", onKey, { capture: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKey, { capture: true });
    };
  }, [base.durationMs, finish]);

  const veilMotion = reduced
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.25 },
      }
    : {
        initial: { clipPath: "inset(100% 0 0 0)" },
        animate: { clipPath: "inset(0% 0 0 0)" },
        exit: { clipPath: "inset(0 0 100% 0)" },
        transition: { duration: 0.62, ease: EASE_WIPE },
      };

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={base.title}
      onClick={finish}
      {...veilMotion}
      {...stylex.props(styles.veil)}
    >
      <motion.div
        aria-hidden
        initial={{ x: "-50%", y: "-50%", scale: 0.6, opacity: 0 }}
        animate={{ x: "-50%", y: "-50%", scale: 1, opacity: 0.32 }}
        transition={{ duration: 1.6, ease: EASE_OUT, delay: 0.2 }}
        {...stylex.props(styles.glow)}
      />

      <div {...stylex.props(styles.content)}>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5, ease: EASE_OUT }}
          {...stylex.props(styles.eyebrow)}
        >
          <CheckMark delay={0.5} reduced={reduced} />
          {base.eyebrow}
        </motion.p>

        <h2 {...stylex.props(styles.title)}>
          <Words text={base.title} delay={0.55} reduced={reduced} />
        </h2>

        {milestone.kind === "greeting" ? <Sunrise delay={0.7} reduced={reduced} /> : null}

        {milestone.kind === "figure" ? (
          <BigFigure figure={milestone.figure} delay={0.85} reduced={reduced} />
        ) : null}

        {milestone.kind === "pair" ? (
          <div {...stylex.props(styles.pair)}>
            <BigFigure figure={milestone.figures[0]} delay={0.85} reduced={reduced} small />
            <BigFigure figure={milestone.figures[1]} delay={1.05} reduced={reduced} small />
          </div>
        ) : null}

        {milestone.kind === "progress" ? (
          <ProgressRing value={milestone.progress} delay={0.8} reduced={reduced} />
        ) : null}

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.35, duration: 0.6, ease: EASE_OUT }}
          {...stylex.props(styles.detail)}
        >
          {base.detail}
        </motion.p>
      </div>

      <div {...stylex.props(styles.bottom)}>
        <p {...stylex.props(styles.hint)}>Entrée ou clic pour continuer</p>
        <motion.div
          aria-hidden
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: base.durationMs / 1000, ease: "linear" }}
          {...stylex.props(styles.timer)}
        />
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Briques d'animation
// ---------------------------------------------------------------------------

/** Titre révélé mot à mot : chaque mot monte depuis un masque, en cascade. */
function Words({ text, delay, reduced }: { text: string; delay: number; reduced: boolean }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((word, i) => (
        <span key={`${word}-${i}`} {...stylex.props(styles.word)}>
          <motion.span
            initial={reduced ? { opacity: 0 } : { y: "110%" }}
            animate={reduced ? { opacity: 1 } : { y: 0 }}
            transition={{ delay: delay + i * 0.055, duration: 0.65, ease: EASE_OUT }}
            {...stylex.props(styles.wordInner)}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </>
  );
}

function formatFigure(figure: MilestoneFigure, value: number): string {
  switch (figure.format) {
    case "fcfa":
      return formatFcfa(value);
    case "integer":
      return formatNumber(value, 0);
    case "decimal1":
      return formatNumber(value, 1);
  }
}

/** Grand chiffre qui compte jusqu'à sa valeur, avec un ralentissement marqué sur la fin. */
function BigFigure({
  figure,
  delay,
  reduced,
  small = false,
}: {
  figure: MilestoneFigure;
  delay: number;
  reduced: boolean;
  small?: boolean;
}) {
  const raw = useMotionValue(reduced ? figure.value : 0);
  const text = useTransform(raw, (v) => formatFigure(figure, v));

  useEffect(() => {
    if (reduced) {
      raw.set(figure.value);
      return;
    }
    const controls = animate(raw, figure.value, { delay, duration: 1.5, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [raw, figure.value, delay, reduced]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: EASE_OUT }}
    >
      <motion.div {...stylex.props(styles.figure, small && styles.figureSmall)}>{text}</motion.div>
      <div {...stylex.props(styles.figureLabel)}>{figure.label}</div>
    </motion.div>
  );
}

/** Coche tracée au stylo : petit signal « section validée » à côté de l'étape. */
function CheckMark({ delay, reduced }: { delay: number; reduced: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <motion.circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="1.6"
        initial={{ pathLength: reduced ? 1 : 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay, duration: 0.6, ease: EASE_OUT }}
      />
      <motion.path
        d="M7.5 12.5l3 3 6-6.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: reduced ? 1 : 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: delay + 0.35, duration: 0.4, ease: EASE_OUT }}
      />
    </svg>
  );
}

/** Soleil qui se lève sur l'horizon, tracé trait par trait : la signature Solarity pour dire bonjour. */
function Sunrise({ delay, reduced }: { delay: number; reduced: boolean }) {
  const rays = [-60, -30, 0, 30, 60];
  const draw = (extra: number, duration: number) => ({
    initial: { pathLength: reduced ? 1 : 0, opacity: reduced ? 1 : 0 },
    animate: { pathLength: 1, opacity: 1 },
    transition: { delay: delay + extra, duration, ease: EASE_OUT },
  });
  return (
    <svg width="160" height="84" viewBox="0 0 160 84" fill="none" aria-hidden>
      {/* Horizon */}
      <motion.line
        x1="4"
        y1="80"
        x2="156"
        y2="80"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        {...draw(0, 0.7)}
      />
      {/* Demi-disque */}
      <motion.path
        d="M44 80 A36 36 0 0 1 116 80"
        style={{ stroke: colors.accent }}
        strokeWidth="3"
        strokeLinecap="round"
        {...draw(0.25, 0.8)}
      />
      {rays.map((angle, i) => {
        const rad = ((angle - 90) * Math.PI) / 180;
        const x1 = 80 + Math.cos(rad) * 46;
        const y1 = 80 + Math.sin(rad) * 46;
        const x2 = 80 + Math.cos(rad) * 58;
        const y2 = 80 + Math.sin(rad) * 58;
        return (
          <motion.line
            key={angle}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            style={{ stroke: colors.accent }}
            strokeWidth="2.5"
            strokeLinecap="round"
            {...draw(0.75 + i * 0.07, 0.35)}
          />
        );
      })}
    </svg>
  );
}

/** Anneau de progression tracé jusqu'au pourcentage atteint, avec le chiffre qui monte à côté. */
function ProgressRing({
  value,
  delay,
  reduced,
}: {
  value: number;
  delay: number;
  reduced: boolean;
}) {
  const pct = Math.round(value * 100);
  const raw = useMotionValue(reduced ? pct : 0);
  const text = useTransform(raw, (v) => `${Math.round(v)} % du diagnostic`);

  useEffect(() => {
    if (reduced) {
      raw.set(pct);
      return;
    }
    const controls = animate(raw, pct, { delay, duration: 1.3, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [raw, pct, delay, reduced]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.4 }}
      {...stylex.props(styles.ringWrap)}
    >
      <svg width="72" height="72" viewBox="0 0 72 72" fill="none" aria-hidden>
        <circle
          cx="36"
          cy="36"
          r="30"
          stroke="currentColor"
          strokeOpacity="0.2"
          strokeWidth="5"
        />
        <motion.circle
          cx="36"
          cy="36"
          r="30"
          style={{ stroke: colors.accent }}
          strokeWidth="5"
          strokeLinecap="round"
          transform="rotate(-90 36 36)"
          initial={{ pathLength: reduced ? value : 0 }}
          animate={{ pathLength: value }}
          transition={{ delay, duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <motion.span {...stylex.props(styles.ringPercent)}>{text}</motion.span>
    </motion.div>
  );
}
