import * as stylex from "@stylexjs/stylex";
import Link from "next/link";
import { Brand } from "@/components/layout/Brand";
import { Button } from "@/components/ui/button";
import { colors } from "@/lib/tokens.stylex";

const styles = stylex.create({
  page: { display: "flex", flexDirection: "column", minHeight: "100dvh" },
  header: {
    alignItems: "center",
    display: "flex",
    justifyContent: "space-between",
    paddingBlock: "1.25rem",
    paddingInline: "clamp(1rem, 4vw, 3rem)",
  },
  hero: {
    display: "grid",
    flex: 1,
    gap: "2.5rem",
    gridTemplateColumns: { default: "1.15fr 1fr", "@media (max-width: 900px)": "1fr" },
    paddingBlock: "clamp(2rem, 8vh, 6rem)",
    paddingInline: "clamp(1rem, 4vw, 3rem)",
  },
  eyebrow: {
    color: colors.primary,
    fontSize: "0.8rem",
    fontWeight: 700,
    letterSpacing: "0.25em",
    textTransform: "uppercase",
  },
  title: {
    fontFamily: "var(--font-display)",
    fontSize: "clamp(2.1rem, 5vw, 3.6rem)",
    fontWeight: 800,
    lineHeight: 1.05,
    marginBlock: "1rem 1.5rem",
    textTransform: "uppercase",
  },
  lead: { color: colors.mutedForeground, fontSize: "1.1rem", lineHeight: 1.6, maxWidth: "36rem" },
  actions: {
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    gap: "1rem",
    marginTop: "2rem",
  },
  hint: { color: colors.mutedForeground, fontSize: "0.85rem" },
  card: {
    alignSelf: "center",
    backgroundColor: colors.primary,
    borderRadius: "1.25rem",
    color: colors.primaryForeground,
    display: "grid",
    gap: "1.25rem",
    padding: "clamp(1.5rem, 3vw, 2.5rem)",
  },
  cardTitle: {
    fontFamily: "var(--font-display)",
    fontSize: "1.1rem",
    fontWeight: 700,
    textTransform: "uppercase",
  },
  steps: { display: "grid", gap: "0.9rem", listStyle: "none", margin: 0, padding: 0 },
  step: { alignItems: "baseline", display: "flex", gap: "0.8rem", lineHeight: 1.5 },
  stepNumber: { color: colors.accent, fontFamily: "var(--font-display)", fontWeight: 800 },
});

const STEPS = [
  "Décrivez votre site en 8 courtes étapes (10 minutes).",
  "Nous chiffrons vos coûts visibles et cachés : facture, carburant, arrêts de production, personnel immobilisé.",
  "Trois scénarios solaires sont comparés : économies, délai de retour, coût cumulé sur 10 ans.",
  "Vous recevez un rapport de 9 pages, prêt à présenter à votre direction.",
];

export default function HomePage() {
  return (
    <main {...stylex.props(styles.page)}>
      <header {...stylex.props(styles.header)}>
        <Brand />
      </header>
      <section {...stylex.props(styles.hero)}>
        <div>
          <p {...stylex.props(styles.eyebrow)}>Diagnostic énergétique</p>
          <h1 {...stylex.props(styles.title)}>
            Combien vous coûte vraiment l&apos;instabilité du réseau ?
          </h1>
          <p {...stylex.props(styles.lead)}>
            Coupures, groupe électrogène, production perdue : mesurez le coût annuel réel de votre
            alimentation électrique et découvrez le scénario solaire qui le réduit le plus vite.
          </p>
          <div {...stylex.props(styles.actions)}>
            <Button size="lg" render={<Link href="/diagnostic" />}>
              Commencer le diagnostic
            </Button>
            <span {...stylex.props(styles.hint)}>Gratuit · aucune création de compte</span>
          </div>
        </div>
        <aside {...stylex.props(styles.card)}>
          <h2 {...stylex.props(styles.cardTitle)}>Comment ça marche</h2>
          <ol {...stylex.props(styles.steps)}>
            {STEPS.map((step, i) => (
              <li key={step} {...stylex.props(styles.step)}>
                <span {...stylex.props(styles.stepNumber)}>0{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </aside>
      </section>
    </main>
  );
}
