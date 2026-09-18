"use client";

import { BigInput } from "../primitives/BigInput";
import type { EmailQuestion, TextQuestion } from "../../definition/types";
import type { RendererProps } from "./types";

export function TextRenderer({
  question,
  value,
  onChange,
  onSubmit,
  error,
  autoFocus,
}: RendererProps<TextQuestion | EmailQuestion, string>) {
  const isEmail = question.type === "email";
  return (
    <BigInput
      type={isEmail ? "email" : "text"}
      inputMode={isEmail ? "email" : "text"}
      autoComplete={isEmail ? "email" : "off"}
      autoCapitalize={isEmail ? "none" : "sentences"}
      placeholder={
        isEmail
          ? "vous@entreprise.com"
          : (("placeholder" in question ? question.placeholder : undefined) ?? "Votre réponse")
      }
      maxLength={"maxLength" in question ? question.maxLength : undefined}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && onSubmit()}
      invalid={Boolean(error)}
      autoFocus={autoFocus}
    />
  );
}
