"use client";

import * as stylex from "@stylexjs/stylex";
import { OptionCard } from "../primitives/OptionCard";
import type { YesNoQuestion } from "../../definition/types";
import { useHotkeys } from "./useHotkeys";
import type { RendererProps } from "./types";

const styles = stylex.create({
  row: {
    display: "grid",
    gap: "0.75rem",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    maxWidth: "24rem",
    width: "100%",
  },
});

export function YesNoRenderer({
  value,
  onChange,
  onSubmit,
}: RendererProps<YesNoQuestion, boolean>) {
  const select = (v: boolean) => {
    onChange(v);
    window.setTimeout(onSubmit, 220);
  };
  useHotkeys({ O: () => select(true), N: () => select(false) });

  return (
    <div role="listbox" {...stylex.props(styles.row)}>
      <OptionCard hotkey="O" label="Oui" selected={value === true} onSelect={() => select(true)} />
      <OptionCard
        hotkey="N"
        label="Non"
        selected={value === false}
        onSelect={() => select(false)}
      />
    </div>
  );
}
