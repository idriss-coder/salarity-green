import {
  Defs,
  Image,
  LinearGradient,
  Page,
  Path,
  StyleSheet,
  Stop,
  Svg,
  Text,
  View,
} from "@react-pdf/renderer";
import type { ReactNode } from "react";
import { ASSETS } from "../resources";
import { COLORS, FONTS, LAYOUT, PAGE } from "../theme";

const styles = StyleSheet.create({
  page: { backgroundColor: COLORS.background, fontFamily: FONTS.body, color: COLORS.white },
  background: { position: "absolute", top: 0, left: 0, width: PAGE.width, height: PAGE.height },
  veil: {
    position: "absolute",
    top: 0,
    left: 0,
    width: PAGE.width,
    height: PAGE.height,
    backgroundColor: COLORS.textureVeil,
    opacity: LAYOUT.textureVeilOpacity,
  },
  pill: {
    position: "absolute",
    top: 0,
    right: 0,
    width: LAYOUT.pill.width,
    height: LAYOUT.pill.height,
  },
  pillNumber: {
    position: "absolute",
    top: 0,
    right: 0,
    width: LAYOUT.pill.width,
    height: LAYOUT.pill.height,
    alignItems: "center",
    justifyContent: "center",
    fontFamily: FONTS.body,
    fontSize: 20,
    fontWeight: 600,
    color: COLORS.white,
    paddingLeft: 8,
  },
  header: {
    position: "absolute",
    top: LAYOUT.titleTop,
    left: LAYOUT.marginX,
    right: LAYOUT.pill.width + 12,
  },
  title: {
    fontFamily: FONTS.display,
    fontWeight: 800,
    fontSize: LAYOUT.titleSize,
    lineHeight: 1.12,
    letterSpacing: 1,
    color: COLORS.white,
    textTransform: "uppercase",
  },
  accent: {
    marginTop: 26,
    width: LAYOUT.accentLineWidth,
    height: LAYOUT.accentLineHeight,
    backgroundColor: COLORS.accent,
  },
});

interface PageFrameProps {
  /** Numéro affiché dans la pastille (numérotation du modèle : 1, 2, 3, 4, 5, 7, 9, 11, 12). */
  number: number;
  title?: string;
  /** `false` = pas de ligne d'accent sous le titre (page 12). */
  accent?: boolean;
  children?: ReactNode;
}

/** Cadre commun : fond texturé adouci par un voile uni, pastille de numéro en dégradé, titre en capitales et ligne d'accent. */
export function PageFrame({ number, title, accent = true, children }: PageFrameProps) {
  // Les titres longs (2 lignes dans le modèle) passent en corps 40 pour ne pas déborder sur 3 lignes.
  const titleSize = title && title.length > 48 ? 40 : LAYOUT.titleSize;
  const { width, height } = LAYOUT.pill;
  const r = height / 2;
  const br = 34; // arrondi bas-droit
  return (
    <Page size={[PAGE.width, PAGE.height]} style={styles.page}>
      <Image src={ASSETS.background} style={styles.background} />
      <View style={styles.veil} />
      <Svg style={styles.pill} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <LinearGradient id="pill" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={COLORS.pillStart} />
            <Stop offset="1" stopColor={COLORS.pillEnd} />
          </LinearGradient>
        </Defs>
        <Path
          d={`M ${r} 0 H ${width} V ${height - br} A ${br} ${br} 0 0 1 ${width - br} ${height} H ${r} A ${r} ${r} 0 0 1 ${r} 0 Z`}
          fill="url(#pill)"
        />
      </Svg>
      <View style={styles.pillNumber}>
        <Text>{number}</Text>
      </View>
      {title ? (
        <View style={styles.header}>
          <Text style={[styles.title, { fontSize: titleSize }]}>{title}</Text>
          {accent ? <View style={styles.accent} /> : null}
        </View>
      ) : null}
      {children}
    </Page>
  );
}
