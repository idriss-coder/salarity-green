import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { HBarChart } from "../charts/HBarChart";
import { PageFrame } from "../components/PageFrame";
import { COLORS } from "../theme";
import type { ReportViewModel } from "../view-model";

const CARD = { left: 279, top: 270, width: 814, height: 428 };

const styles = StyleSheet.create({
  card: {
    position: "absolute",
    left: CARD.left,
    top: CARD.top,
    width: CARD.width,
    height: CARD.height,
    backgroundColor: COLORS.white,
    borderRadius: 4,
    padding: 18,
  },
  title: { fontSize: 14, fontWeight: 700, color: COLORS.ink },
  subtitle: { fontSize: 11, color: COLORS.chartMuted, marginTop: 4, marginBottom: 10 },
  caption: {
    position: "absolute",
    left: CARD.left,
    top: CARD.top + CARD.height + 26,
    fontSize: 18,
    color: COLORS.white,
  },
});

export function CostChartPage({ vm }: { vm: ReportViewModel }) {
  const chartW = CARD.width - 36;
  const chartH = CARD.height - 36 - 52;
  return (
    <PageFrame number={4} title="CE QUE COÛTE LA SITUATION ACTUELLE">
      <View style={styles.card}>
        <Text style={styles.title}>{vm.costChart.title}</Text>
        <Text style={styles.subtitle}>{vm.costChart.subtitle}</Text>
        <HBarChart bars={vm.costChart.bars} width={chartW} height={chartH} />
      </View>
      <Text style={styles.caption}>{vm.costChart.caption}</Text>
    </PageFrame>
  );
}
