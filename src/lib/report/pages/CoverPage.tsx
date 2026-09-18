import { Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { ASSETS } from "../resources";
import { COLORS, FONTS, PAGE } from "../theme";
import type { ReportViewModel } from "../view-model";

const styles = StyleSheet.create({
  page: { backgroundColor: COLORS.background, fontFamily: FONTS.body, color: COLORS.white },
  photo: {
    position: "absolute",
    top: 0,
    left: 0,
    width: PAGE.width,
    height: PAGE.height,
    objectFit: "cover",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: PAGE.width,
    height: PAGE.height,
    backgroundColor: COLORS.background,
    opacity: 0.62,
  },
  header: {
    position: "absolute",
    top: 32,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
  },
  headerLine: { width: 96, height: 2, backgroundColor: COLORS.white, marginRight: 34 },
  headerText: { fontSize: 20, letterSpacing: 1, color: COLORS.white },
  pill: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 118,
    height: 80,
    borderBottomLeftRadius: 40,
    borderTopLeftRadius: 40,
    borderBottomRightRadius: 34,
    backgroundColor: COLORS.pillStart,
    alignItems: "center",
    justifyContent: "center",
  },
  pillText: { fontSize: 20, fontWeight: 600, paddingLeft: 8 },
  title: {
    position: "absolute",
    top: 200,
    left: 22,
    width: 1180,
    fontFamily: FONTS.display,
    fontWeight: 800,
    fontSize: 46,
    lineHeight: 1.08,
    color: COLORS.white,
  },
  subtitle: {
    position: "absolute",
    top: 336,
    left: 22,
    width: 900,
    fontSize: 19,
    fontWeight: 700,
    color: COLORS.white,
  },
  technician: {
    position: "absolute",
    right: 70,
    top: 300,
    width: 325,
    height: 510,
    objectFit: "contain",
  },
  logoBox: {
    position: "absolute",
    left: 22,
    bottom: 44,
    width: 108,
    height: 108,
    backgroundColor: COLORS.white,
    padding: 10,
  },
  logo: { width: 88, height: 88 },
});

export function CoverPage({ vm }: { vm: ReportViewModel }) {
  return (
    <Page size={[PAGE.width, PAGE.height]} style={styles.page}>
      <Image src={ASSETS.coverPhoto} style={styles.photo} />
      <View style={styles.overlay} />
      <View style={styles.header}>
        <View style={styles.headerLine} />
        <Text style={styles.headerText}>PRÉSENTATION</Text>
      </View>
      <View style={styles.pill}>
        <Text style={styles.pillText}>1</Text>
      </View>
      <Text style={styles.title}>{vm.cover.title}</Text>
      <Text style={styles.subtitle}>{vm.cover.subtitle}</Text>
      <Image src={ASSETS.technician} style={styles.technician} />
      <View style={styles.logoBox}>
        <Image src={ASSETS.logoSquare} style={styles.logo} />
      </View>
    </Page>
  );
}
