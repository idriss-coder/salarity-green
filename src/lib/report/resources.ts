import path from "node:path";
import { Font } from "@react-pdf/renderer";
import { FONTS } from "./theme";

/**
 * Polices et images du rapport, résolues depuis le système de fichiers.
 * Ces dossiers sont inclus dans le bundle serverless via `outputFileTracingIncludes` (next.config.ts).
 */
const ROOT = path.join(process.cwd(), "src", "lib", "report");

export const ASSETS = {
  background: path.join(ROOT, "assets", "bg-texture.jpg"),
  coverPhoto: path.join(ROOT, "assets", "cover-photo.jpg"),
  technician: path.join(ROOT, "assets", "technician.png"),
  logoSquare: path.join(ROOT, "assets", "logo-square.jpg"),
  logoTransparent: path.join(ROOT, "assets", "logo-transparent.png"),
  whyDesk: path.join(ROOT, "assets", "why-photo-desk.jpg"),
  whyPlant: path.join(ROOT, "assets", "why-photo-plant.jpg"),
} as const;

let registered = false;

export function registerFonts(): void {
  if (registered) return;
  registered = true;
  const fonts = path.join(ROOT, "fonts");
  Font.register({
    family: FONTS.display,
    fonts: [
      { src: path.join(fonts, "Montserrat-Bold.ttf"), fontWeight: 700 },
      { src: path.join(fonts, "Montserrat-ExtraBold.ttf"), fontWeight: 800 },
    ],
  });
  Font.register({
    family: FONTS.body,
    fonts: [
      { src: path.join(fonts, "OpenSans-Regular.ttf"), fontWeight: 400 },
      { src: path.join(fonts, "OpenSans-SemiBold.ttf"), fontWeight: 600 },
      { src: path.join(fonts, "OpenSans-Bold.ttf"), fontWeight: 700 },
    ],
  });
  // Pas de césure automatique : les mots français seraient coupés n'importe où.
  Font.registerHyphenationCallback((word) => [word]);
}
