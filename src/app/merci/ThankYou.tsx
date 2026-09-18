"use client";

import * as stylex from "@stylexjs/stylex";
import { AnimatePresence, motion } from "motion/react";
import { Download, FileCheck2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ProcessingOverlay } from "@/components/feedback/ProcessingOverlay";
import { Brand } from "@/components/layout/Brand";
import { Button } from "@/components/ui/button";
import { RESULT_STORAGE_KEY, type SubmissionResult } from "@/features/diagnostic-form";
import { colors, radius } from "@/lib/tokens.stylex";

const styles = stylex.create({
  page: { display: "flex", flexDirection: "column", minHeight: "100dvh" },
  header: { paddingBlock: "1.25rem", paddingInline: "clamp(1rem, 4vw, 3rem)" },
  main: {
    alignItems: "center",
    display: "flex",
    flex: 1,
    justifyContent: "center",
    paddingInline: "clamp(1rem, 6vw, 5rem)",
    paddingBlock: "2rem 6rem",
  },
  card: { display: "grid", gap: "1.25rem", maxWidth: "36rem", textAlign: "center" },
  icon: {
    alignItems: "center",
    backgroundColor: `color-mix(in oklab, ${colors.primary} 10%, ${colors.card})`,
    borderRadius: radius.full,
    color: colors.primary,
    display: "inline-flex",
    height: "4.5rem",
    justifyContent: "center",
    justifySelf: "center",
    width: "4.5rem",
  },
  title: {
    fontFamily: "var(--font-display)",
    fontSize: "clamp(1.6rem, 3.5vw, 2.3rem)",
    fontWeight: 800,
    lineHeight: 1.15,
    textTransform: "uppercase",
  },
  lead: { color: colors.mutedForeground, fontSize: "1.05rem", lineHeight: 1.6 },
  actions: { display: "flex", flexWrap: "wrap", gap: "0.75rem", justifyContent: "center" },
  small: { color: colors.mutedForeground, fontSize: "0.85rem" },
  error: { color: colors.destructive, fontSize: "0.9rem", fontWeight: 600 },
});

/** Phrases d'attente pendant le téléchargement : le serveur vérifie le lien puis relit le PDF stocké. */
const DOWNLOAD_MESSAGES = [
  "Vérification de votre lien sécurisé…",
  "Récupération de votre rapport…",
  "Préparation du fichier PDF…",
  "Le téléchargement va démarrer…",
];

/** Nom de fichier annoncé par le serveur (Content-Disposition), sinon un nom par défaut. */
function fileNameFrom(response: Response, fallback: string): string {
  const header = response.headers.get("Content-Disposition") ?? "";
  const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(header);
  return match ? decodeURIComponent(match[1]) : fallback;
}

/** Page de fin : lien de téléchargement signé, remis par l'API et conservé en sessionStorage. */
export function ThankYou() {
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const [ready, setReady] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string>();

  // Téléchargement piloté : on récupère le PDF en mémoire pour savoir quand il est là, puis on le
  // remet au navigateur. Un simple lien ne donnerait aucun retour pendant les secondes d'attente.
  const download = useCallback(async () => {
    if (!result || downloading) return;
    setDownloading(true);
    setDownloadError(undefined);
    const started = Date.now();
    try {
      const response = await fetch(result.downloadUrl);
      if (!response.ok) throw new Error("Le lien de téléchargement n'est plus valide.");
      const blob = await response.blob();
      // Laisser le voile respirer au moins un instant : un flash de 200 ms serait plus déroutant qu'utile.
      const remaining = 1400 - (Date.now() - started);
      if (remaining > 0) await new Promise((resolve) => window.setTimeout(resolve, remaining));
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = fileNameFrom(response, `rapport-${result.companyName || "solarity"}.pdf`);
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } catch (error) {
      setDownloadError(
        error instanceof Error ? error.message : "Le téléchargement a échoué. Réessayez.",
      );
    } finally {
      setDownloading(false);
    }
  }, [result, downloading]);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(RESULT_STORAGE_KEY);
      if (raw) setResult(JSON.parse(raw) as SubmissionResult);
    } catch {
      // ignore
    }
    setReady(true);
  }, []);

  return (
    <div {...stylex.props(styles.page)}>
      <header {...stylex.props(styles.header)}>
        <Brand />
      </header>
      <main {...stylex.props(styles.main)}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 26 }}
          {...stylex.props(styles.card)}
        >
          <span {...stylex.props(styles.icon)}>
            <FileCheck2 size={34} aria-hidden />
          </span>
          <h1 {...stylex.props(styles.title)}>
            {result ? `Votre rapport est prêt, ${result.companyName}` : "Votre rapport est prêt"}
          </h1>
          <p {...stylex.props(styles.lead)}>
            {result
              ? `Nous avons enregistré votre diagnostic. L'équipe Solarity Green vous contactera à ${result.email} pour le présenter ; vous pouvez déjà le télécharger.`
              : "Nous avons enregistré votre diagnostic. L'équipe Solarity Green vous contactera pour le présenter."}
          </p>
          <div {...stylex.props(styles.actions)}>
            {ready && result ? (
              <Button size="lg" onClick={download} disabled={downloading}>
                <Download size={18} aria-hidden /> Télécharger le rapport (PDF)
              </Button>
            ) : null}
            <Button variant="outline" size="lg" render={<Link href="/" />}>
              Retour à l&apos;accueil
            </Button>
          </div>
          {downloadError ? (
            <p role="alert" {...stylex.props(styles.error)}>
              {downloadError}{" "}
              {result ? (
                <a href={result.downloadUrl} download>
                  Ouvrir le lien directement
                </a>
              ) : null}
            </p>
          ) : null}
          <p {...stylex.props(styles.small)}>Rapport de 9 pages, format présentation 16:9.</p>
        </motion.div>
      </main>
      <AnimatePresence>
        {downloading ? (
          <ProcessingOverlay
            key="download"
            title="Téléchargement en cours"
            messages={DOWNLOAD_MESSAGES}
            intervalMs={1500}
            note="Votre rapport s'ouvrira dans un instant."
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
