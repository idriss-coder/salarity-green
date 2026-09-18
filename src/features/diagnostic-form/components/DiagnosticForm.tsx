"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ProcessingOverlay } from "@/components/feedback/ProcessingOverlay";
import { formDefinition } from "../definition/form.definition";
import { endsSection, milestoneFor, type Milestone } from "../engine/milestones";
import { useFormEngine } from "../engine/useFormEngine";
import { FormShell } from "./FormShell";
import { MilestoneOverlay } from "./MilestoneOverlay";
import { QuestionScreen } from "./QuestionScreen";

/** Réponse de POST /api/submissions, transmise à la page Merci via sessionStorage. */
export interface SubmissionResult {
  id: string;
  downloadUrl: string;
  companyName: string;
  email: string;
}

export const RESULT_STORAGE_KEY = "sgr:last-submission";

/** Glissement vertical : la question suivante monte, la précédente descend. */
const screenVariants = {
  enter: (direction: 1 | -1) => ({ opacity: 0, y: direction * 48 }),
  center: { opacity: 1, y: 0 },
  exit: (direction: 1 | -1) => ({ opacity: 0, y: direction * -48 }),
};

/** Phrases d'attente pendant la génération : elles suivent l'ordre réel du calcul côté serveur. */
const GENERATION_MESSAGES = [
  "Analyse de vos réponses…",
  "Chiffrage des coûts visibles et cachés…",
  "Comparaison des trois scénarios solaires…",
  "Calcul du délai de retour sur investissement…",
  "Mise en page des 9 pages du rapport…",
  "Enregistrement sécurisé…",
  "Encore quelques secondes…",
];

export function DiagnosticForm() {
  const engine = useFormEngine(formDefinition);
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>();
  const [milestone, setMilestone] = useState<Milestone | null>(null);
  // Jalons déjà montrés : revenir en arrière puis ré-avancer ne doit pas les rejouer.
  const seenMilestones = useRef(new Set<string>());

  const submitAll = useCallback(async () => {
    setSubmitting(true);
    setSubmitError(undefined);
    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(engine.answers),
      });
      const body = (await response.json()) as {
        id?: string;
        downloadUrl?: string;
        error?: string;
        issues?: Array<{ path: string; message: string }>;
      };
      if (!response.ok || !body.id || !body.downloadUrl) {
        const detail = body.issues?.[0]
          ? ` (${body.issues[0].path} : ${body.issues[0].message})`
          : "";
        throw new Error((body.error ?? "Échec de la soumission") + detail);
      }
      const result: SubmissionResult = {
        id: body.id,
        downloadUrl: body.downloadUrl,
        companyName: String(engine.answers["company.name"] ?? ""),
        email: String(engine.answers["contact.email"] ?? ""),
      };
      try {
        window.sessionStorage.setItem(RESULT_STORAGE_KEY, JSON.stringify(result));
      } catch {
        // sessionStorage indisponible : la page Merci affichera un message générique
      }
      engine.clearDraft();
      router.push("/merci");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Échec de la soumission");
      setSubmitting(false);
    }
  }, [engine, router]);

  const handleSubmit = useCallback(() => {
    if (submitting || milestone) return;
    // Fin de section : on valide sans avancer, on montre le jalon, et c'est sa fermeture qui avance.
    const sectionId = engine.step.section.id;
    if (endsSection(engine.steps, engine.index) && !seenMilestones.current.has(sectionId)) {
      if (!engine.validateCurrent()) return;
      const next = milestoneFor(formDefinition, sectionId, engine.answers, engine.progress);
      if (next) {
        seenMilestones.current.add(sectionId);
        setMilestone(next);
        return;
      }
    }
    const advanced = engine.submitCurrent();
    if (advanced && engine.isLast) void submitAll();
  }, [engine, submitting, milestone, submitAll]);

  const closeMilestone = useCallback(() => {
    setMilestone(null);
    engine.next();
  }, [engine]);

  // Navigation clavier globale : ↑ / ↓ entre les questions (Entrée est gérée par chaque renderer).
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (milestone || submitting) return;
      if (event.key === "ArrowUp" && !engine.isFirst) engine.prev();
      if (event.key === "ArrowDown" && engine.answers[engine.step.question.id] !== undefined)
        handleSubmit();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [engine, milestone, submitting, handleSubmit]);

  const { step, index, total, answers, error, state } = engine;
  const companyName = String(answers["company.name"] ?? "").trim();

  return (
    <FormShell
      progress={engine.progress}
      index={index}
      total={total}
      canPrev={!engine.isFirst && !submitting && !milestone}
      canNext={!engine.isLast && answers[step.question.id] !== undefined && !milestone}
      onPrev={engine.prev}
      onNext={handleSubmit}
    >
      <AnimatePresence mode="wait" custom={state.direction} initial={false}>
        <motion.div
          key={step.question.id}
          custom={state.direction}
          variants={screenVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "spring", stiffness: 260, damping: 30, mass: 0.8 }}
          style={{ width: "100%", display: "flex", justifyContent: "center" }}
        >
          <QuestionScreen
            step={step}
            index={index}
            answers={answers}
            value={answers[step.question.id]}
            error={submitError ?? error}
            isLast={engine.isLast}
            submitting={submitting}
            onChange={(value) => engine.setAnswer(step.question.id, value)}
            onSubmit={handleSubmit}
          />
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {milestone ? (
          <MilestoneOverlay key={milestone.base.id} milestone={milestone} onDone={closeMilestone} />
        ) : null}
        {submitting ? (
          <ProcessingOverlay
            key="generation"
            title={companyName ? `Votre rapport se prépare, ${companyName}` : "Votre rapport se prépare"}
            messages={GENERATION_MESSAGES}
          />
        ) : null}
      </AnimatePresence>
    </FormShell>
  );
}
