import { Image, StyleSheet, Text, View } from "@react-pdf/renderer";
import { PageFrame } from "../components/PageFrame";
import { Rich } from "../components/Rich";
import { ASSETS } from "../resources";
import { COLORS, FONTS } from "../theme";
import type { ReportViewModel } from "../view-model";

const styles = StyleSheet.create({
  plant: {
    position: "absolute",
    left: 0,
    top: 120,
    width: 180,
    height: 620,
    borderTopRightRadius: 90,
    borderBottomRightRadius: 90,
    objectFit: "cover",
  },
  desk: {
    position: "absolute",
    left: 214,
    top: 120,
    width: 330,
    height: 620,
    borderRadius: 165,
    objectFit: "cover",
  },
  title: {
    position: "absolute",
    left: 630,
    top: 170,
    fontFamily: FONTS.display,
    fontWeight: 800,
    fontSize: 40,
    color: COLORS.white,
  },
  accent: {
    position: "absolute",
    left: 630,
    top: 276,
    width: 100,
    height: 4,
    backgroundColor: COLORS.accent,
  },
  body: { position: "absolute", left: 630, top: 370, width: 720 },
  paragraph: { fontSize: 20, lineHeight: 1.45, marginBottom: 24, color: COLORS.white },
});

export function WhyPage({ vm }: { vm: ReportViewModel }) {
  return (
    <PageFrame number={2}>
      <Image src={ASSETS.whyPlant} style={styles.plant} />
      <Image src={ASSETS.whyDesk} style={styles.desk} />
      <Text style={styles.title}>POURQUOI CE POINT ?</Text>
      <View style={styles.accent} />
      <View style={styles.body}>
        <Rich segments={vm.why.objective} style={styles.paragraph} />
        <Rich segments={vm.why.scope} style={styles.paragraph} />
        <Rich segments={vm.why.method} style={styles.paragraph} />
      </View>
    </PageFrame>
  );
}
