/**
 * Le formulaire est une donnée : sections → questions.
 * Chaque question a un `id` (clé plate des réponses), un `type` (→ un renderer) et
 * éventuellement une condition d'affichage `showIf` évaluée sur les réponses.
 */

export type Answers = Record<string, unknown>;

export type Condition =
  | { field: string; equals: unknown }
  | { field: string; in: readonly unknown[] }
  | { all: readonly Condition[] }
  | { any: readonly Condition[] };

export interface Option<V extends string = string> {
  value: V;
  label: string;
  description?: string;
}

interface QuestionBase {
  id: string;
  /** Titre affiché en grand : la question elle-même. */
  title: string;
  /** Aide contextuelle, en petit sous le titre. */
  description?: string;
  /** `false` = peut être passée. Défaut `true`. */
  required?: boolean;
  showIf?: Condition;
}

export interface TextQuestion extends QuestionBase {
  type: "text";
  placeholder?: string;
  maxLength?: number;
}

export interface NumberQuestion extends QuestionBase {
  type: "number";
  /** Unité affichée dans le champ : « unités/heure », « min », « % »… */
  unit?: string;
  min?: number;
  max?: number;
  integer?: boolean;
  placeholder?: string;
}

export interface CurrencyQuestion extends QuestionBase {
  type: "currency";
  /** Suffixe de période ou d'unité : « /mois », « /litre »… */
  per?: string;
  min?: number;
}

export interface ChoiceQuestion extends QuestionBase {
  type: "choice";
  options: readonly Option[];
}

export interface MultiChoiceQuestion extends QuestionBase {
  type: "multichoice";
  options: readonly Option[];
}

export interface YesNoQuestion extends QuestionBase {
  type: "yesno";
}

export interface SelectQuestion extends QuestionBase {
  type: "select";
  options: readonly Option[];
  /** Autorise une valeur hors liste (secteur « Autre »). */
  allowCustom?: boolean;
}

export interface FrequencyQuestion extends QuestionBase {
  type: "frequency";
}
export interface FrequencyValue {
  count: number;
  per: "day" | "week" | "month";
}

export interface MonthTableQuestion extends QuestionBase {
  type: "monthTable";
}
export interface MonthAmount {
  month: string; // "2026-01"
  amount: number | null;
}

export interface EmailQuestion extends QuestionBase {
  type: "email";
}

/** Écran de récapitulatif : pas de valeur, affiche les montants annualisés avant soumission. */
export interface SummaryQuestion extends QuestionBase {
  type: "summary";
}

export type Question =
  | TextQuestion
  | NumberQuestion
  | CurrencyQuestion
  | ChoiceQuestion
  | MultiChoiceQuestion
  | YesNoQuestion
  | SelectQuestion
  | FrequencyQuestion
  | MonthTableQuestion
  | EmailQuestion
  | SummaryQuestion;

export type QuestionType = Question["type"];

export interface Section {
  id: string;
  title: string;
  /** Phrase d'introduction affichée sur l'écran de transition de section. */
  intro?: string;
  questions: readonly Question[];
}

export interface FormDefinition {
  /** Version de la structure des réponses, stockée avec chaque soumission. */
  version: number;
  sections: readonly Section[];
}
