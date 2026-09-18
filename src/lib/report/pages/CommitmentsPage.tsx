import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { PageFrame } from "../components/PageFrame";
import { COLORS, FONTS } from "../theme";
import type { ReportViewModel } from "../view-model";

const styles = StyleSheet.create({
  subtitle: {
    position: "absolute",
    left: 80,
    top: 210,
    fontSize: 19,
    fontWeight: 700,
    color: COLORS.white,
  },
  card: {
    position: "absolute",
    left: 80,
    top: 252,
    width: 1280,
    height: 512,
    backgroundColor: COLORS.white,
    borderRadius: 6,
    paddingHorizontal: 22,
    paddingVertical: 14,
  },
  row: { flexDirection: "row", flex: 1, alignItems: "center" },
  head: { fontFamily: FONTS.body, fontWeight: 700, fontSize: 12, color: COLORS.ink },
  cell: {
    fontFamily: FONTS.body,
    fontWeight: 700,
    fontSize: 11,
    lineHeight: 1.4,
    color: COLORS.ink,
    paddingRight: 24,
  },
});

const COLS = [1.15, 1.25, 1.1];

export function CommitmentsPage({ vm }: { vm: ReportViewModel }) {
  return (
    <PageFrame
      number={12}
      title="UN INVESTISSEMENT SÉCURISÉ SUR TOUTE LA DURÉE DE VIE DU PROJET"
      accent={false}
    >
      <Text style={styles.subtitle}>
        Technologie éprouvée, autonomie des équipes et accompagnement local
      </Text>
      <View style={styles.card}>
        <View style={[styles.row, { flex: 0.6 }]}>
          <Text style={[styles.head, { flex: COLS[0] }]}>Engagement</Text>
          <Text style={[styles.head, { flex: COLS[1] }]}>Description</Text>
          <Text style={[styles.head, { flex: COLS[2] }]}>
            Ce que cela sécurise pour {vm.meta.companyName}
          </Text>
        </View>
        {vm.commitments.map((c) => (
          <View key={c.commitment} style={styles.row}>
            <Text style={[styles.cell, { flex: COLS[0] }]}>{c.commitment}</Text>
            <Text style={[styles.cell, { flex: COLS[1] }]}>{c.description}</Text>
            <Text style={[styles.cell, { flex: COLS[2] }]}>{c.secures}</Text>
          </View>
        ))}
      </View>
    </PageFrame>
  );
}
