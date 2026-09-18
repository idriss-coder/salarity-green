/**
 * Charte du rapport, relevée sur le modèle BEG (Canva, 1440 × 810 pt, 16:9).
 * Couleurs échantillonnées sur le PDF source.
 */
export const PAGE = { width: 1440, height: 810 } as const;

export const COLORS = {
  /** Vert du fond texturé (moyenne relevée sur le modèle). */
  background: "#224929",
  /** Voile uni posé sur la texture : le modèle est presque plat, le relief ne doit pas gêner la lecture. */
  textureVeil: "#2d5a34",
  /** Ligne d'accent sous les titres. */
  accent: "#94b94e",
  /** Dégradé de la pastille de numéro de page. */
  pillStart: "#8bb04b",
  pillEnd: "#406837",
  white: "#ffffff",
  /** Texte des tableaux sur fond blanc. */
  ink: "#111111",
  tableBorder: "#000000",
  /** Barres du graphique de la page 4. */
  chartBar: "#6ba8f9",
  /** Séries de la courbe cumulée (page 9) : actuel, S1, S2, S3. */
  series: ["#3b82f6", "#22c55e", "#f97316", "#facc15"],
  chartGrid: "#e5e7eb",
  chartText: "#374151",
  chartMuted: "#6b7280",
  /** Mise en avant du premier motif de la recommandation (page 11). */
  highlight: "#fbb40c",
} as const;

export const FONTS = {
  /** Titres en capitales, larges : substitut libre d'Anantason. */
  display: "Montserrat",
  body: "Open Sans",
} as const;

/** Marges et rythme communs. */
export const LAYOUT = {
  marginX: 48,
  titleTop: 58,
  titleSize: 46,
  accentLineWidth: 110,
  accentLineHeight: 4,
  bodySize: 17,
  pill: { width: 118, height: 80, radius: 40 },
  /** Opacité du voile sur la texture : 0 = texture brute (trop contrastée), 1 = aplat. */
  textureVeilOpacity: 0.7,
} as const;
