import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { PageFrame } from "../components/PageFrame";
import { Table } from "../components/Table";
import { COLORS } from "../theme";
import type { ReportViewModel } from "../view-model";

const styles = StyleSheet.create({
  table: { position: "absolute", left: 112, top: 240, width: 1180 },
  notes: { position: "absolute", left: 112, top: 742, fontSize: 13, color: COLORS.white },
});

export function ScenarioTablePage({ vm }: { vm: ReportViewModel }) {
  const { baselineHeader, scenarioHeaders, rows, totalRow, footnotes } = vm.scenarioTable;
  const tableRows = [
    ["Poste", baselineHeader, ...scenarioHeaders],
    ...rows.map((r) => [r.label, r.baseline, ...r.reductions]),
    [totalRow.label, totalRow.baseline, ...totalRow.reductions],
  ];
  return (
    <PageFrame number={7} title="LES 3 SCENARIOS PROPOSÉS ET IMPACT SUR L'EXISTANT">
      <Table
        columns={[1.1, 1.2, 1.2, 1.2, 1.2]}
        rows={tableRows}
        minRowHeight={58}
        fontSize={12}
        style={styles.table}
      />
      <View style={styles.notes}>
        {footnotes.map((f) => (
          <Text key={f}>{f}</Text>
        ))}
      </View>
    </PageFrame>
  );
}
