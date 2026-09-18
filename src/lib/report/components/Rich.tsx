import { StyleSheet, Text, type TextProps } from "@react-pdf/renderer";

type Style = NonNullable<TextProps["style"]>;
import type { Segment } from "../view-model";

const styles = StyleSheet.create({ bold: { fontWeight: 700 } });

/** Rend une suite de fragments (gras / normal) dans un seul bloc de texte. */
export function Rich({ segments, style }: { segments: Segment[]; style?: Style }) {
  return (
    <Text style={style}>
      {segments.map((s, i) => (
        <Text key={i} style={s.bold ? styles.bold : undefined}>
          {s.text}
        </Text>
      ))}
    </Text>
  );
}
