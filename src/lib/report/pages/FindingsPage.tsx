import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { PageFrame } from "../components/PageFrame";
import { Rich } from "../components/Rich";
import { COLORS } from "../theme";
import type { ReportViewModel } from "../view-model";

const styles = StyleSheet.create({
  body: { position: "absolute", left: 82, top: 290, width: 1240 },
  heading: { fontSize: 19, fontWeight: 700, marginBottom: 10, color: COLORS.white },
  bullet: { flexDirection: "row", marginBottom: 8, paddingLeft: 26 },
  dot: { width: 18, fontSize: 19, lineHeight: 1.4, color: COLORS.white },
  text: { flex: 1, fontSize: 19, lineHeight: 1.4, color: COLORS.white },
});

export function FindingsPage({ vm }: { vm: ReportViewModel }) {
  return (
    <PageFrame number={3} title={vm.findings.heading}>
      <View style={styles.body}>
        <Text style={styles.heading}>Principaux constats</Text>
        {vm.findings.bullets.map((segments, i) => (
          <View key={i} style={styles.bullet}>
            <Text style={styles.dot}>•</Text>
            <Rich segments={segments} style={styles.text} />
          </View>
        ))}
      </View>
    </PageFrame>
  );
}
