import * as stylex from "@stylexjs/stylex";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { DeleteSubmissionButton } from "@/components/admin/DeleteSubmissionButton";
import { formatDateTime } from "@/components/admin/format";
import { Button } from "@/components/ui/button";
import { formDefinition } from "@/features/diagnostic-form";
import { formatBp, formatFcfa, formatMillions, formatPayback } from "@/lib/engine";
import { colors, radius } from "@/lib/tokens.stylex";
import { getSubmission } from "@/lib/submissions/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const detail = await getSubmission((await params).id);
  return { title: detail ? detail.companyName : "Soumission" };
}

const styles = stylex.create({
  back: { color: colors.mutedForeground, fontSize: "0.85rem", textDecoration: "none" },
  head: {
    alignItems: "flex-start",
    display: "flex",
    flexWrap: "wrap",
    gap: "1rem",
    justifyContent: "space-between",
    marginBlock: "0.75rem 1.5rem",
  },
  title: {
    fontFamily: "var(--font-display)",
    fontSize: "1.6rem",
    fontWeight: 800,
    textTransform: "uppercase",
  },
  meta: {
    color: colors.mutedForeground,
    display: "grid",
    fontSize: "0.9rem",
    gap: "0.15rem",
    marginTop: "0.35rem",
  },
  grid: {
    display: "grid",
    gap: "1.5rem",
    gridTemplateColumns: {
      default: "minmax(0, 1.1fr) minmax(0, 1fr)",
      "@media (max-width: 1000px)": "1fr",
    },
  },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderStyle: "solid",
    borderWidth: "1px",
    padding: "1.25rem",
  },
  cardTitle: {
    fontSize: "0.8rem",
    fontWeight: 700,
    letterSpacing: "0.1em",
    marginBottom: "0.9rem",
    textTransform: "uppercase",
  },
  table: { borderCollapse: "collapse", fontSize: "0.9rem", width: "100%" },
  th: { color: colors.mutedForeground, fontWeight: 600, paddingBlock: "0.4rem", textAlign: "left" },
  td: {
    borderTopColor: colors.border,
    borderTopStyle: "solid",
    borderTopWidth: "1px",
    paddingBlock: "0.45rem",
    paddingRight: "0.75rem",
    verticalAlign: "top",
  },
  num: { fontVariantNumeric: "tabular-nums", textAlign: "right", whiteSpace: "nowrap" },
  total: { fontWeight: 700 },
  muted: { color: colors.mutedForeground, fontSize: "0.8rem" },
  warning: {
    backgroundColor: `color-mix(in oklab, ${colors.accent} 20%, transparent)`,
    borderRadius: radius.sm,
    fontSize: "0.85rem",
    marginTop: "0.75rem",
    paddingBlock: "0.4rem",
    paddingInline: "0.6rem",
  },
  frame: {
    aspectRatio: "16 / 10",
    borderColor: colors.border,
    borderRadius: radius.md,
    borderStyle: "solid",
    borderWidth: "1px",
    width: "100%",
  },
  answers: { display: "grid", gap: "1rem" },
  section: { display: "grid", gap: "0.3rem" },
  sectionTitle: { color: colors.primary, fontSize: "0.85rem", fontWeight: 700 },
  answer: { display: "flex", fontSize: "0.85rem", gap: "1rem", justifyContent: "space-between" },
  answerLabel: { color: colors.mutedForeground },
  answerValue: { textAlign: "right" },
  actions: { alignItems: "center", display: "flex", gap: "0.5rem" },
});

function answerToText(value: unknown): string {
  if (value === undefined || value === null || value === "") return "—";
  if (typeof value === "boolean") return value ? "Oui" : "Non";
  if (Array.isArray(value))
    return value
      .map((v) =>
        typeof v === "object" && v && "month" in v
          ? `${(v as { month: string }).month}: ${(v as { amount: number | null }).amount ?? "—"}`
          : String(v),
      )
      .join(", ");
  if (typeof value === "object" && "count" in (value as object)) {
    const f = value as { count: number; per: string };
    return `${f.count} par ${{ day: "jour", week: "semaine", month: "mois" }[f.per] ?? f.per}`;
  }
  return String(value);
}

export default async function AdminDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const detail = await getSubmission((await params).id);
  if (!detail) notFound();
  const { snapshot } = detail;
  const recommended = snapshot.scenarios.find((s) => s.key === snapshot.recommendation.scenarioKey);

  return (
    <AdminShell>
      <Link href="/admin" {...stylex.props(styles.back)}>
        ← Toutes les soumissions
      </Link>
      <div {...stylex.props(styles.head)}>
        <div>
          <h1 {...stylex.props(styles.title)}>{detail.companyName}</h1>
          <div {...stylex.props(styles.meta)}>
            <span>
              {detail.city} · {detail.sector}
              {detail.contactName ? ` · ${detail.contactName}` : ""}
            </span>
            <span>
              {detail.email} · soumis le {formatDateTime(detail.createdAt)}
            </span>
            <span>
              Moteur v{detail.engineVersion} · formulaire v{detail.schemaVersion} · PDF{" "}
              {(detail.pdf.size / 1024).toFixed(0)} Ko · sha256 {detail.pdf.sha256.slice(0, 12)}…
            </span>
          </div>
        </div>
        <div {...stylex.props(styles.actions)}>
          <Button render={<a href={`/api/admin/submissions/${detail.id}/pdf`} />}>
            Télécharger le PDF
          </Button>
          <DeleteSubmissionButton
            id={detail.id}
            companyName={detail.companyName}
            redirectTo="/admin"
          />
        </div>
      </div>

      <div {...stylex.props(styles.grid)}>
        <div style={{ display: "grid", gap: "1.5rem" }}>
          <section {...stylex.props(styles.card)}>
            <h2 {...stylex.props(styles.cardTitle)}>
              Situation actuelle — {formatFcfa(snapshot.baseline.total)} / an
            </h2>
            <table {...stylex.props(styles.table)}>
              <thead>
                <tr>
                  <th {...stylex.props(styles.th)}>Poste</th>
                  <th {...stylex.props(styles.th)}>Détail</th>
                  <th {...stylex.props(styles.th, styles.num)}>Montant annuel</th>
                </tr>
              </thead>
              <tbody>
                {snapshot.baseline.items.map((item) => (
                  <tr key={item.key}>
                    <td {...stylex.props(styles.td)}>
                      {item.label}
                      {item.category === "hidden" ? "*" : ""}
                    </td>
                    <td {...stylex.props(styles.td, styles.muted)}>
                      {item.applicable
                        ? item.formulaDetail
                        : `Non applicable — ${item.notApplicableReason}`}
                    </td>
                    <td {...stylex.props(styles.td, styles.num)}>
                      {item.applicable ? formatFcfa(item.amount) : "—"}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td {...stylex.props(styles.td, styles.total)}>Total</td>
                  <td {...stylex.props(styles.td)}></td>
                  <td {...stylex.props(styles.td, styles.num, styles.total)}>
                    {formatFcfa(snapshot.baseline.total)}
                  </td>
                </tr>
              </tbody>
            </table>
            {snapshot.baseline.warnings.map((w) => (
              <p key={w.code} {...stylex.props(styles.warning)}>
                {w.message}
              </p>
            ))}
          </section>

          <section {...stylex.props(styles.card)}>
            <h2 {...stylex.props(styles.cardTitle)}>
              Scénarios — recommandé : {recommended?.label}
            </h2>
            <table {...stylex.props(styles.table)}>
              <thead>
                <tr>
                  <th {...stylex.props(styles.th)}>Scénario</th>
                  <th {...stylex.props(styles.th, styles.num)}>Investissement</th>
                  <th {...stylex.props(styles.th, styles.num)}>Résiduel</th>
                  <th {...stylex.props(styles.th, styles.num)}>Économie</th>
                  <th {...stylex.props(styles.th, styles.num)}>Réduction</th>
                  <th {...stylex.props(styles.th, styles.num)}>Retour</th>
                </tr>
              </thead>
              <tbody>
                {snapshot.scenarios.map((s) => (
                  <tr key={s.key}>
                    <td {...stylex.props(styles.td, s.key === recommended?.key && styles.total)}>
                      {s.label}
                    </td>
                    <td {...stylex.props(styles.td, styles.num)}>
                      {formatMillions(s.investment, 1)}
                    </td>
                    <td {...stylex.props(styles.td, styles.num)}>
                      {formatMillions(s.residualTotal)}
                    </td>
                    <td {...stylex.props(styles.td, styles.num)}>
                      {formatMillions(s.savingsPerYear)}
                    </td>
                    <td {...stylex.props(styles.td, styles.num)}>{formatBp(s.totalReductionBp)}</td>
                    <td {...stylex.props(styles.td, styles.num)}>
                      {s.paybackYearsHundredths === null
                        ? "—"
                        : formatPayback(s.paybackYearsHundredths)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <ul
              {...stylex.props(styles.muted)}
              style={{ marginTop: "0.75rem", paddingLeft: "1rem" }}
            >
              {snapshot.recommendation.reasons.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </section>

          <section {...stylex.props(styles.card)}>
            <h2 {...stylex.props(styles.cardTitle)}>Réponses</h2>
            <div {...stylex.props(styles.answers)}>
              {formDefinition.sections.map((section) => {
                const rows = section.questions.filter(
                  (q) => q.type !== "summary" && detail.answers[q.id] !== undefined,
                );
                if (rows.length === 0) return null;
                return (
                  <div key={section.id} {...stylex.props(styles.section)}>
                    <h3 {...stylex.props(styles.sectionTitle)}>{section.title}</h3>
                    {rows.map((q) => (
                      <div key={q.id} {...stylex.props(styles.answer)}>
                        <span {...stylex.props(styles.answerLabel)}>{q.title}</span>
                        <span {...stylex.props(styles.answerValue)}>
                          {answerToText(detail.answers[q.id])}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <section {...stylex.props(styles.card)}>
          <h2 {...stylex.props(styles.cardTitle)}>Rapport</h2>
          <iframe
            title="Aperçu du rapport"
            src={`/api/admin/submissions/${detail.id}/pdf?inline=1`}
            {...stylex.props(styles.frame)}
          />
        </section>
      </div>
    </AdminShell>
  );
}
