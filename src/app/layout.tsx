import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Solarity Green — Diagnostic énergétique", template: "%s · Solarity Green" },
  description:
    "Chiffrez ce que l'instabilité du réseau électrique coûte réellement à votre site industriel et comparez trois scénarios solaires.",
};

export const viewport: Viewport = {
  themeColor: "#224929",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
