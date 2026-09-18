"use client";

import { Input as InputPrimitive } from "@base-ui/react/input";
import * as stylex from "@stylexjs/stylex";
import { forwardRef, type ComponentProps } from "react";
import { colors } from "@/lib/tokens.stylex";

const styles = stylex.create({
  wrap: {
    alignItems: "baseline",
    display: "flex",
    gap: "0.75rem",
    maxWidth: "36rem",
    width: "100%",
  },
  input: {
    backgroundColor: "transparent",
    borderBottomColor: {
      default: `color-mix(in oklab, ${colors.primary} 35%, transparent)`,
      ":focus": colors.primary,
    },
    borderBottomStyle: "solid",
    borderBottomWidth: "2px",
    borderTop: "none",
    borderLeft: "none",
    borderRight: "none",
    color: colors.foreground,
    flex: 1,
    fontFamily: "inherit",
    fontSize: "clamp(1.4rem, 3vw, 1.9rem)",
    fontWeight: 400,
    minWidth: 0,
    outline: "none",
    paddingBlock: "0.5rem",
    paddingInline: 0,
    transitionDuration: "150ms",
    transitionProperty: "border-color",
    "::placeholder": { color: `color-mix(in oklab, ${colors.foreground} 30%, transparent)` },
  },
  invalid: { borderBottomColor: colors.destructive },
  suffix: {
    color: colors.mutedForeground,
    fontSize: "clamp(1rem, 2vw, 1.25rem)",
    whiteSpace: "nowrap",
  },
});

export type BigInputProps = Omit<ComponentProps<"input">, "style"> & {
  /** Unité ou période affichée à droite du champ : « FCFA / mois ». */
  suffix?: string;
  invalid?: boolean;
};

/** Champ de saisie « immersif » : grand, sans cadre, souligné, unité dans le champ. */
export const BigInput = forwardRef<HTMLInputElement, BigInputProps>(function BigInput(
  { suffix, invalid, ...props },
  ref,
) {
  return (
    <div {...stylex.props(styles.wrap)}>
      <InputPrimitive
        ref={ref}
        aria-invalid={invalid || undefined}
        {...stylex.props(styles.input, invalid && styles.invalid)}
        {...props}
      />
      {suffix ? <span {...stylex.props(styles.suffix)}>{suffix}</span> : null}
    </div>
  );
});
