"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { validateAnswer } from "../definition/schema";
import type { Answers, FormDefinition } from "../definition/types";
import { clearDraft, loadDraft, saveDraft } from "./persistence";
import {
  createReducer,
  currentStep,
  initialState,
  progress,
  steps,
  type FormState,
} from "./reducer";

/**
 * Hook du parcours : expose l'étape courante, la navigation et la validation.
 * Toute la logique est dans le reducer (pur) ; le hook n'ajoute que la persistance et les callbacks.
 */
export function useFormEngine(definition: FormDefinition) {
  const reducer = useMemo(() => createReducer(definition), [definition]);
  const [state, dispatch] = useReducer(reducer, initialState);
  const restored = useRef(false);
  // Miroir de l'état le plus récent : `submitCurrent` le lit au lieu de sa closure, sinon un
  // `onChange` suivi immédiatement d'un `onSubmit` (choix unique, oui/non…) validerait l'ancienne valeur.
  const latest = useRef(state);
  latest.current = state;

  // Restauration du brouillon au montage (côté client uniquement).
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    const draft = loadDraft(definition.version);
    if (draft) dispatch({ type: "restore", state: { answers: draft.answers, index: draft.index } });
  }, [definition.version]);

  // Autosauvegarde à chaque changement.
  useEffect(() => {
    if (!restored.current) return;
    saveDraft(definition.version, { answers: state.answers, index: state.index });
  }, [definition.version, state.answers, state.index]);

  const allSteps = useMemo(() => steps(definition, state.answers), [definition, state.answers]);
  const step = useMemo(() => currentStep(definition, state), [definition, state]);
  const isLast = state.index >= allSteps.length - 1;

  const setAnswer = useCallback((id: string, value: unknown) => {
    // Mise à jour anticipée du miroir : la valeur est visible de `submitCurrent` avant le re-rendu.
    latest.current = { ...latest.current, answers: { ...latest.current.answers, [id]: value } };
    dispatch({ type: "answer", id, value });
  }, []);

  /** Valide la question courante sans avancer (normalise la valeur, pose l'erreur). Retourne `true` si valide. */
  const validateCurrent = useCallback((): boolean => {
    const current = latest.current;
    const { question } = currentStep(definition, current);
    const answer = current.answers[question.id];
    if (question.type === "summary") return true;
    const result = validateAnswer(question, answer);
    if (!result.ok) {
      dispatch({ type: "error", message: result.message });
      return false;
    }
    if (result.value !== answer) dispatch({ type: "answer", id: question.id, value: result.value });
    return true;
  }, [definition]);

  /** Valide la question courante ; avance si elle est valide. Retourne `true` si on a avancé. */
  const submitCurrent = useCallback((): boolean => {
    if (!validateCurrent()) return false;
    const current = latest.current;
    const last = current.index >= steps(definition, current.answers).length - 1;
    if (!last) dispatch({ type: "next" });
    return true;
  }, [definition, validateCurrent]);

  /** Avance sans valider : réservé aux enchaînements où la validation a déjà eu lieu (jalons). */
  const next = useCallback(() => dispatch({ type: "next" }), []);
  const prev = useCallback(() => dispatch({ type: "prev" }), []);
  const goTo = useCallback((index: number) => dispatch({ type: "goTo", index }), []);
  const reset = useCallback(() => {
    clearDraft(definition.version);
    dispatch({ type: "reset" });
  }, [definition.version]);

  return {
    state,
    step,
    steps: allSteps,
    index: state.index,
    total: allSteps.length,
    isFirst: state.index === 0,
    isLast,
    progress: progress(definition, state.answers),
    answers: state.answers as Answers,
    error: state.error,
    setAnswer,
    validateCurrent,
    submitCurrent,
    next,
    prev,
    goTo,
    reset,
    clearDraft: () => clearDraft(definition.version),
  };
}

export type FormEngine = ReturnType<typeof useFormEngine>;
export type { FormState };
