import { z } from "zod";
import { allQuestions, isVisible } from "./conditions";
import { formDefinition } from "./form.definition";
import type { Answers, Question } from "./types";

/** Schéma Zod d'une valeur pour un type de question. */
export function questionSchema(question: Question): z.ZodType {
  switch (question.type) {
    case "text":
      return z
        .string()
        .trim()
        .min(1, "Réponse requise")
        .max(question.maxLength ?? 200, "Réponse trop longue");
    case "number": {
      let schema = z.number({ error: "Saisissez un nombre" }).finite();
      if (question.integer) schema = schema.int("Nombre entier attendu");
      if (question.min !== undefined) schema = schema.min(question.min, `Minimum ${question.min}`);
      if (question.max !== undefined) schema = schema.max(question.max, `Maximum ${question.max}`);
      return schema;
    }
    case "currency": {
      let schema = z
        .number({ error: "Saisissez un montant" })
        .finite()
        .int("Montant en FCFA entiers");
      schema = schema.min(question.min ?? 0, `Minimum ${question.min ?? 0}`);
      return schema;
    }
    case "choice":
      return z.enum(question.options.map((o) => o.value) as [string, ...string[]], {
        error: "Choisissez une option",
      });
    case "multichoice":
      return z
        .array(z.enum(question.options.map((o) => o.value) as [string, ...string[]]))
        .min(1, "Choisissez au moins une option");
    case "yesno":
      return z.boolean({ error: "Répondez par oui ou non" });
    case "select":
      return question.allowCustom
        ? z.string().trim().min(1, "Choisissez ou saisissez une valeur").max(60)
        : z.enum(question.options.map((o) => o.value) as [string, ...string[]], {
            error: "Choisissez une option",
          });
    case "frequency":
      return z.object({
        count: z.number().finite().positive("Indiquez un nombre de coupures"),
        per: z.enum(["day", "week", "month"]),
      });
    case "monthTable":
      return z
        .array(
          z.object({
            month: z.string().regex(/^\d{4}-\d{2}$/),
            amount: z.number().int().min(0).nullable(),
          }),
        )
        .length(12)
        .refine(
          (rows) => rows.some((r) => r.amount !== null && r.amount > 0),
          "Saisissez au moins un mois",
        );
    case "email":
      return z.email("Adresse email invalide").max(120);
    case "summary":
      return z.unknown();
  }
}

/** Valide une seule réponse (utilisé par le formulaire à chaque étape). */
export function validateAnswer(
  question: Question,
  value: unknown,
): { ok: true; value: unknown } | { ok: false; message: string } {
  if (question.required === false && (value === undefined || value === null || value === "")) {
    return { ok: true, value: undefined };
  }
  const result = questionSchema(question).safeParse(value);
  if (result.success) return { ok: true, value: result.data };
  return { ok: false, message: result.error.issues[0]?.message ?? "Réponse invalide" };
}

/**
 * Schéma complet : chaque champ est optionnel individuellement, puis une passe vérifie
 * que toutes les questions **visibles** et requises ont une réponse valide.
 * Les réponses de questions non visibles sont supprimées (elles ne doivent pas influencer le calcul).
 */
export const answersSchema = z
  .object(
    Object.fromEntries(allQuestions(formDefinition).map((q) => [q.id, z.unknown().optional()])),
  )
  .superRefine((raw, ctx) => {
    const answers = raw as Answers;
    for (const question of allQuestions(formDefinition)) {
      if (question.type === "summary" || !isVisible(question, answers)) continue;
      const result = validateAnswer(question, answers[question.id]);
      if (!result.ok)
        ctx.addIssue({ code: "custom", path: [question.id], message: result.message });
    }
  })
  .transform((raw) => {
    const answers = raw as Answers;
    const cleaned: Answers = {};
    for (const question of allQuestions(formDefinition)) {
      if (question.type === "summary" || !isVisible(question, answers)) continue;
      const result = validateAnswer(question, answers[question.id]);
      if (result.ok && result.value !== undefined) cleaned[question.id] = result.value;
    }
    return cleaned;
  });

export type ValidatedAnswers = z.infer<typeof answersSchema>;
