import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // react-pdf (et ses dépendances natives-like : fontkit, pdfkit) doit rester hors du bundle webpack côté serveur.
  serverExternalPackages: ["@react-pdf/renderer"],
  // Polices et images du rapport lues sur le disque : à embarquer avec les fonctions serverless.
  // pdfkit charge ses polices standard (Helvetica, Times, Courier…) via les "imports" de son
  // package.json (ex. "#standard-fonts/Helvetica" -> "./js/standard-fonts/Helvetica.cjs").
  // Le traçage de fichiers de Next ne suit pas ces sous-chemins dynamiques : sans cette ligne,
  // ces .cjs manquent du bundle Vercel et le rendu PDF plante avec "Cannot find module […Helvetica.cjs]".
  outputFileTracingIncludes: {
    "/api/**": [
      "./src/lib/report/assets/**",
      "./src/lib/report/fonts/**",
      "./node_modules/.pnpm/pdfkit@*/node_modules/pdfkit/js/standard-fonts/**",
      "./node_modules/.pnpm/pdfkit@*/node_modules/pdfkit/lib/**",
    ],
  },
};

export default nextConfig;
