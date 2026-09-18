import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { CumulativeChart } from "../charts/CumulativeChart";
import { PageFrame } from "../components/PageFrame";
import { Table } from "../components/Table";
import { COLORS } from "../theme";
import type { ReportViewModel } from "../view-model";

const CARD = { left: 18, top: 248, width: 720, height: 412 };

const styles = StyleSheet.create({
  card: {
    position: "absolute",
    left: CARD.left,
    top: CARD.top,
    width: CARD.width,
    height: CARD.height,
    backgroundColor: COLORS.white,
    borderRadius: 4,
    padding: 16,
  },
  title: { fontSize: 14, fontWeight: 700, color: COLORS.ink },
  subtitle: { fontSize: 10, color: COLORS.chartMuted, marginTop: 3, marginBottom: 8 },
  legend: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", marginTop: 6 },
  legendItem: { flexDirection: "row", alignItems: "center", marginHorizontal: 8, marginBottom: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 5 },
  legendText: { fontSize: 10, color: COLORS.chartText },
  table: { position: "absolute", left: 766, top: 248, width: 646 },
});

export function RoiPage({ vm }: { vm: ReportViewModel }) {
  const { chartTitle, chartSubtitle, series, horizonYears, rows } = vm.roi;
  const tableRows = [
    ["Scénario", "Investissement", "Coût annuel résiduel", "Économie annuelle", "Délai de retour"],
    ...rows.map((r) => [r.label, r.investment, r.residual, r.savings, r.payback]),
  ];
  return (
    <PageFrame number={9} title="LES 3 SCENARIOS PROPOSÉS ET SCHEMA DE ROI">
      <View style={styles.card}>
        <Text style={styles.title}>{chartTitle}</Text>
        <Text style={styles.subtitle}>{chartSubtitle}</Text>
        <CumulativeChart
          series={series}
          horizonYears={horizonYears}
          width={CARD.width - 32}
          height={CARD.height - 32 - 90}
        />
        <View style={styles.legend}>
          {series.map((s, i) => (
            <View key={s.label} style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: COLORS.series[i % COLORS.series.length] },
                ]}
              />
              <Text style={styles.legendText}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>
      <Table
        columns={[1.1, 1, 1, 1, 0.9]}
        rows={tableRows}
        minRowHeight={78}
        fontSize={12}
        style={styles.table}
      />
    </PageFrame>
  );
}
