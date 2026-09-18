import { visibleQuestions } from "../definition/conditions";
import type { Answers, FormDefinition, Question, Section } from "../definition/types";

/**
 * État du parcours : réponses + question courante.
 * `index` désigne une position dans la liste des questions **visibles**, recalculée à chaque réponse
 * (répondre « non » à une porte fait disparaître les questions conditionnelles qui suivent).
 */
export interface FormState {
  answers: Answers;
  index: number;
  /** Sens de la dernière navigation, pour l'animation. */
  direction: 1 | -1;
  /** Erreur de validation de la question courante. */
  error?: string;
}

export type FormAction =
  | { type: "answer"; id: string; value: unknown }
  | { type: "next" }
  | { type: "prev" }
  | { type: "goTo"; index: number }
  | { type: "error"; message: string }
  | { type: "restore"; state: Pick<FormState, "answers" | "index"> }
  | { type: "reset" };

export interface Step {
  section: Section;
  question: Question;
  /** Première question de sa section : l'écran affiche l'intro de section. */
  isSectionStart: boolean;
}

export const initialState: FormState = { answers: {}, index: 0, direction: 1 };

export function steps(definition: FormDefinition, answers: Answers): Step[] {
  let lastSection: string | undefined;
  return visibleQuestions(definition, answers).map(({ section, question }) => {
    const isSectionStart = section.id !== lastSection;
    lastSection = section.id;
    return { section, question, isSectionStart };
  });
}

export function currentStep(definition: FormDefinition, state: FormState): Step {
  const all = steps(definition, state.answers);
  return all[Math.min(state.index, all.length - 1)];
}

/** Progression 0..1 : questions visibles répondues / questions visibles (hors récapitulatif). */
export function progress(definition: FormDefinition, answers: Answers): number {
  const all = steps(definition, answers).filter((s) => s.question.type !== "summary");
  if (all.length === 0) return 0;
  const answered = all.filter((s) => answers[s.question.id] !== undefined).length;
  return answered / all.length;
}

export function createReducer(definition: FormDefinition) {
  return function reducer(state: FormState, action: FormAction): FormState {
    switch (action.type) {
      case "answer": {
        const answers = { ...state.answers, [action.id]: action.value };
        return { ...state, answers, error: undefined };
      }
      case "next": {
        const count = steps(definition, state.answers).length;
        return {
          ...state,
          index: Math.min(state.index + 1, count - 1),
          direction: 1,
          error: undefined,
        };
      }
      case "prev":
        return { ...state, index: Math.max(state.index - 1, 0), direction: -1, error: undefined };
      case "goTo": {
        const count = steps(definition, state.answers).length;
        const index = Math.max(0, Math.min(action.index, count - 1));
        return { ...state, index, direction: index >= state.index ? 1 : -1, error: undefined };
      }
      case "error":
        return { ...state, error: action.message };
      case "restore": {
        const count = steps(definition, action.state.answers).length;
        return {
          answers: action.state.answers,
          index: Math.max(0, Math.min(action.state.index, count - 1)),
          direction: 1,
        };
      }
      case "reset":
        return initialState;
    }
  };
}
