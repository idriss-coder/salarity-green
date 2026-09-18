import * as stylex from "@stylexjs/stylex";
import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { SubmissionRow } from "@/components/admin/SubmissionRow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { colors, radius } from "@/lib/tokens.stylex";
import { listSubmissions } from "@/lib/submissions/queries";

export const metadata: Metadata = { title: "Soumissions" };
export const dynamic = "force-dynamic";

const styles = stylex.create({
  toolbar: {
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    gap: "1rem",
    justifyContent: "space-between",
    marginBottom: "1.5rem",
  },
  title: {
    fontFamily: "var(--font-display)",
    fontSize: "1.4rem",
    fontWeight: 700,
    textTransform: "uppercase",
  },
  search: { alignItems: "center", display: "flex", gap: "0.5rem" },
  tableWrap: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderStyle: "solid",
    borderWidth: "1px",
    overflowX: "auto",
  },
  table: { borderCollapse: "collapse", fontSize: "0.9rem", minWidth: "56rem", width: "100%" },
  th: {
    borderBottomColor: colors.border,
    borderBottomStyle: "solid",
    borderBottomWidth: "1px",
    color: colors.mutedForeground,
    fontWeight: 600,
    paddingBlock: "0.75rem",
    paddingInline: "1rem",
    textAlign: "left",
    whiteSpace: "nowrap",
  },
  num: { fontVariantNumeric: "tabular-nums", textAlign: "right", whiteSpace: "nowrap" },
  muted: { color: colors.mutedForeground, fontSize: "0.8rem" },
  empty: { color: colors.mutedForeground, padding: "3rem", textAlign: "center" },
});

export default async function AdminListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const items = await listSubmissions({ search: q });

  return (
    <AdminShell>
      <div {...stylex.props(styles.toolbar)}>
        <h1 {...stylex.props(styles.title)}>
          Soumissions <span {...stylex.props(styles.muted)}>({items.length})</span>
        </h1>
        <form method="get" {...stylex.props(styles.search)}>
          <Input name="q" type="search" placeholder="Entreprise ou email" defaultValue={q ?? ""} />
          <Button type="submit" variant="outline" size="sm">
            Rechercher
          </Button>
        </form>
      </div>
      <div {...stylex.props(styles.tableWrap)}>
        {items.length === 0 ? (
          <p {...stylex.props(styles.empty)}>Aucune soumission pour le moment.</p>
        ) : (
          <table {...stylex.props(styles.table)}>
            <thead>
              <tr>
                <th {...stylex.props(styles.th)}>Date</th>
                <th {...stylex.props(styles.th)}>Entreprise</th>
                <th {...stylex.props(styles.th)}>Email</th>
                <th {...stylex.props(styles.th, styles.num)}>Coût annuel actuel</th>
                <th {...stylex.props(styles.th)}>Scénario recommandé</th>
                <th {...stylex.props(styles.th, styles.num)}>Délai de retour</th>
                <th {...stylex.props(styles.th)}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <SubmissionRow key={s.id} submission={s} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminShell>
  );
}
