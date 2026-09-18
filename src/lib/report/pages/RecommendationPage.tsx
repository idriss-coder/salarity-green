import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { PageFrame } from "../components/PageFrame";
import { COLORS } from "../theme";
import type { ReportViewModel } from "../view-model";

const styles = StyleSheet.create({
  body: { position: "absolute", left: 70, top: 280, width: 1240 },
  heading: { fontSize: 19, fontWeight: 700, marginBottom: 8, color: COLORS.white },
  bullet: { flexDirection: "row", paddingLeft: 40, marginBottom: 6 },
  dot: { width: 18, fontSize: 18, color: COLORS.white },
  text: { flex: 1, fontSize: 18, lineHeight: 1.4, color: COLORS.white },
  first: { color: COLORS.highlight, fontWeight: 700 },
  footer: {
    position: "absolute",
    left: 70,
    top: 610,
    width: 1240,
    fontSize: 18,
    lineHeight: 1.45,
    color: COLORS.white,
  },
});

export function RecommendationPage({ vm }: { vm: ReportViewModel }) {
  return (
    <PageFrame number={11} title="NOTRE RECOMMANDATION">
      <View style={styles.body}>
        <Text style={styles.heading}>{vm.recommendation.heading}</Text>
        {vm.recommendation.reasons.map((reason, i) => (
          <View key={reason} style={styles.bullet}>
            <Text style={styles.dot}>•</Text>
            <Text style={[styles.text, i === 0 ? styles.first : {}]}>{reason}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.footer}>{vm.recommendation.footer}</Text>
    </PageFrame>
  );
}
