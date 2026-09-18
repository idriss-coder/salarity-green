"use client";

import * as stylex from "@stylexjs/stylex";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DeleteSubmissionButton } from "@/components/admin/DeleteSubmissionButton";
import { formatDateTime } from "@/components/admin/format";
import { Button } from "@/components/ui/button";
import { formatFcfa, formatPayback } from "@/lib/engine";
import { colors, radius } from "@/lib/tokens.stylex";
import type { SubmissionSummary } from "@/lib/submissions/queries";

const styles = stylex.create({
  row: {
    cursor: "pointer",
  },
  rowHover: {
    backgroundColor: {
      ":hover": colors.muted,
    },
  },
  td: {
    borderBottomColor: colors.border,
    borderBottomStyle: "solid",
    borderBottomWidth: "1px",
    paddingBlock: "0.75rem",
    paddingInline: "1rem",
    verticalAlign: "top",
  },
  num: { fontVariantNumeric: "tabular-nums", textAlign: "right", whiteSpace: "nowrap" },
  company: { color: colors.foreground, fontWeight: 600, textDecoration: "none" },
  muted: { color: colors.mutedForeground, fontSize: "0.8rem" },
  badge: {
    backgroundColor: `color-mix(in oklab, ${colors.accent} 25%, transparent)`,
    borderRadius: radius.sm,
    fontSize: "0.75rem",
    paddingBlock: "0.1rem",
    paddingInline: "0.4rem",
  },
  actions: { display: "flex", gap: "0.5rem" },
});

export function SubmissionRow({ submission: s }: { submission: SubmissionSummary }) {
  const router = useRouter();

  return (
    <tr
      {...stylex.props(styles.row, styles.rowHover)}
      onClick={() => router.push(`/admin/${s.id}`)}
    >
      <td {...stylex.props(styles.td)}>{formatDateTime(s.createdAt)}</td>
      <td {...stylex.props(styles.td)}>
        <Link
          href={`/admin/${s.id}`}
          onClick={(e) => e.stopPropagation()}
          {...stylex.props(styles.company)}
        >
          {s.companyName}
        </Link>
        <div {...stylex.props(styles.muted)}>
          {s.city} · {s.sector}
        </div>
      </td>
      <td {...stylex.props(styles.td)}>{s.email}</td>
      <td {...stylex.props(styles.td, styles.num)}>
        {formatFcfa(s.baselineTotal)}
        {s.warningsCount > 0 ? (
          <div {...stylex.props(styles.badge)}>{s.warningsCount} avertissement(s)</div>
        ) : null}
      </td>
      <td {...stylex.props(styles.td)}>{s.recommendedScenario}</td>
      <td {...stylex.props(styles.td, styles.num)}>
        {s.paybackYearsHundredths === null ? "—" : formatPayback(s.paybackYearsHundredths)}
      </td>
      <td {...stylex.props(styles.td)}>
        <div {...stylex.props(styles.actions)} onClick={(e) => e.stopPropagation()}>
          <Button variant="outline" size="sm" render={<a href={`/api/admin/submissions/${s.id}/pdf`} />}>
            PDF
          </Button>
          <DeleteSubmissionButton id={s.id} companyName={s.companyName} />
        </div>
      </td>
    </tr>
  );
}
