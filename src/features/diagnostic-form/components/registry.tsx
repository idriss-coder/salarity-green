"use client";

import type { Answers, FrequencyValue, MonthAmount, Question } from "../definition/types";
import { ChoiceRenderer, MultiChoiceRenderer } from "./renderers/ChoiceRenderer";
import { FrequencyRenderer } from "./renderers/FrequencyRenderer";
import { MonthTableRenderer } from "./renderers/MonthTableRenderer";
import { NumberRenderer } from "./renderers/NumberRenderer";
import { SelectRenderer } from "./renderers/SelectRenderer";
import { SummaryRenderer } from "./renderers/SummaryRenderer";
import { TextRenderer } from "./renderers/TextRenderer";
import type { RendererProps } from "./renderers/types";
import { YesNoRenderer } from "./renderers/YesNoRenderer";

/** Type de question → composant. Ajouter un type = ajouter une entrée ici et un renderer. */
export function QuestionRenderer(props: RendererProps & { answers: Answers }) {
  const { question } = props;
  switch (question.type) {
    case "text":
    case "email":
      return <TextRenderer {...(props as RendererProps<typeof question, string>)} />;
    case "number":
    case "currency":
      return <NumberRenderer {...(props as RendererProps<typeof question, number>)} />;
    case "choice":
      return <ChoiceRenderer {...(props as RendererProps<typeof question, string>)} />;
    case "select":
      return <SelectRenderer {...(props as RendererProps<typeof question, string>)} />;
    case "multichoice":
      return <MultiChoiceRenderer {...(props as RendererProps<typeof question, string[]>)} />;
    case "yesno":
      return <YesNoRenderer {...(props as RendererProps<typeof question, boolean>)} />;
    case "frequency":
      return <FrequencyRenderer {...(props as RendererProps<typeof question, FrequencyValue>)} />;
    case "monthTable":
      return <MonthTableRenderer {...(props as RendererProps<typeof question, MonthAmount[]>)} />;
    case "summary":
      return (
        <SummaryRenderer
          {...(props as RendererProps<typeof question, never> & { answers: Answers })}
        />
      );
    default: {
      const exhaustive: never = question;
      return exhaustive;
    }
  }
}

/** Les types dont la sélection avance automatiquement : pas de bouton OK. */
export function autoAdvances(question: Question): boolean {
  return (
    question.type === "yesno" ||
    question.type === "choice" ||
    (question.type === "select" && !question.allowCustom)
  );
}
