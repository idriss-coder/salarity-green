import type { Answers, Condition, FormDefinition, Question } from "./types";

export function evaluate(condition: Condition | undefined, answers: Answers): boolean {
  if (!condition) return true;
  if ("all" in condition) return condition.all.every((c) => evaluate(c, answers));
  if ("any" in condition) return condition.any.some((c) => evaluate(c, answers));
  const value = answers[condition.field];
  if ("equals" in condition) return value === condition.equals;
  return condition.in.includes(value);
}

export function isVisible(question: Question, answers: Answers): boolean {
  return evaluate(question.showIf, answers);
}

/** Questions visibles dans l'ordre du formulaire, avec leur section. */
export function visibleQuestions(definition: FormDefinition, answers: Answers) {
  return definition.sections.flatMap((section) =>
    section.questions
      .filter((q) => isVisible(q, answers))
      .map((question) => ({ section, question })),
  );
}

export function allQuestions(definition: FormDefinition): Question[] {
  return definition.sections.flatMap((s) => [...s.questions]);
}

// Raccourcis d'écriture pour la définition.
export const when = {
  yes: (field: string): Condition => ({ field, equals: true }),
  no: (field: string): Condition => ({ field, equals: false }),
  equals: (field: string, value: unknown): Condition => ({ field, equals: value }),
  all: (...conditions: Condition[]): Condition => ({ all: conditions }),
};
