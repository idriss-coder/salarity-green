import { StyleSheet, Text, View, type ViewProps } from "@react-pdf/renderer";

type Style = NonNullable<ViewProps["style"]>;
import type { ReactNode } from "react";
import { COLORS, FONTS } from "../theme";

/**
 * Tableau « modèle BEG » : fond blanc, bordures noires fines, texte gras centré.
 * `columns` = largeurs relatives (flex).
 */
const styles = StyleSheet.create({
  table: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.tableBorder },
  row: { flexDirection: "row", borderBottomWidth: 1, borderColor: COLORS.tableBorder },
  lastRow: { borderBottomWidth: 0 },
  cell: {
    borderRightWidth: 1,
    borderColor: COLORS.tableBorder,
    paddingVertical: 8,
    paddingHorizontal: 10,
    justifyContent: "center",
  },
  lastCell: { borderRightWidth: 0 },
  text: {
    fontFamily: FONTS.body,
    fontWeight: 700,
    fontSize: 12,
    color: COLORS.ink,
    textAlign: "center",
  },
});

export interface TableProps {
  columns: number[];
  rows: ReactNode[][];
  /** Hauteur minimale des lignes (les cellules restent centrées verticalement). La première ligne est l'entête, toujours centrée. */
  minRowHeight?: number;
  fontSize?: number;
  align?: ("left" | "center")[];
  style?: Style;
}

export function Table({
  columns,
  rows,
  minRowHeight = 40,
  fontSize = 12,
  align,
  style,
}: TableProps) {
  return (
    <View style={[styles.table, style ?? {}]}>
      {rows.map((cells, r) => (
        <View
          key={r}
          style={[
            styles.row,
            r === rows.length - 1 ? styles.lastRow : {},
            { minHeight: minRowHeight },
          ]}
        >
          {cells.map((cell, c) => (
            <View
              key={c}
              style={[
                styles.cell,
                c === cells.length - 1 ? styles.lastCell : {},
                { flex: columns[c] },
              ]}
            >
              {typeof cell === "string" ? (
                <Text
                  style={[
                    styles.text,
                    { fontSize, textAlign: r === 0 ? "center" : (align?.[c] ?? "center") },
                  ]}
                >
                  {cell}
                </Text>
              ) : (
                cell
              )}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}
