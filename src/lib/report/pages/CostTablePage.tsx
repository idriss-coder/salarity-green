import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { PageFrame } from "../components/PageFrame";
import { Table } from "../components/Table";
import { COLORS } from "../theme";
import type { ReportViewModel } from "../view-model";

const styles = StyleSheet.create({
  table: { position: "absolute", left: 112, top: 246, width: 1216 },
  notes: { position: "absolute", left: 112, top: 752, fontSize: 12, color: COLORS.white },
  warning: { fontSize: 12, color: COLORS.accent, marginTop: 2 },
});

export function CostTablePage({ vm }: { vm: ReportViewModel }) {
  const { rows, totalLabel, total, footnotes, warnings } = vm.costTable;
  const tableRows = [
    ["Poste", "Formule", "Détails calculs", "Montant Annuel"],
    ...rows.map((r) => [r.label, r.formula, r.detail, r.amount]),
    [totalLabel, "", "", total],
  ];
  return (
    <PageFrame number={5} title="CE QUE COÛTE LA SITUATION ACTUELLE">
      <Table
        columns={[1.4, 1.6, 1.6, 1]}
        rows={tableRows}
        minRowHeight={62}
        fontSize={12}
        align={["center", "left", "left", "center"]}
        style={styles.table}
      />
      <View style={styles.notes}>
        {footnotes.map((f) => (
          <Text key={f}>{f}</Text>
        ))}
        {warnings.map((w) => (
          <Text key={w} style={styles.warning}>
            ⚠ {w}
          </Text>
        ))}
      </View>
    </PageFrame>
  );
}
