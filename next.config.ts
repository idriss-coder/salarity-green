import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // react-pdf (et ses dépendances natives-like : fontkit, pdfkit) doit rester hors du bundle webpack côté serveur.
  serverExternalPackages: ["@react-pdf/renderer"],
  // Polices et images du rapport lues sur le disque : à embarquer avec les fonctions serverless.
  outputFileTracingIncludes: {
    "/api/**": ["./src/lib/report/assets/**", "./src/lib/report/fonts/**"],
  },
};

export default nextConfig;
