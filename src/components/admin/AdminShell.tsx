import * as stylex from "@stylexjs/stylex";
import Link from "next/link";
import type { ReactNode } from "react";
import { Brand } from "@/components/layout/Brand";
import { colors } from "@/lib/tokens.stylex";
import { LogoutButton } from "./LogoutButton";

const styles = stylex.create({
  page: { display: "flex", flexDirection: "column", minHeight: "100dvh" },
  header: {
    alignItems: "center",
    borderBottomColor: colors.border,
    borderBottomStyle: "solid",
    borderBottomWidth: "1px",
    display: "flex",
    gap: "1.5rem",
    justifyContent: "space-between",
    paddingBlock: "0.9rem",
    paddingInline: "clamp(1rem, 4vw, 3rem)",
  },
  nav: { alignItems: "center", display: "flex", gap: "1.25rem" },
  link: { color: colors.mutedForeground, fontSize: "0.9rem", textDecoration: "none" },
  main: { flex: 1, paddingBlock: "2rem", paddingInline: "clamp(1rem, 4vw, 3rem)" },
});

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div {...stylex.props(styles.page)}>
      <header {...stylex.props(styles.header)}>
        <Brand size={30} />
        <nav {...stylex.props(styles.nav)}>
          <Link href="/admin" {...stylex.props(styles.link)}>
            Soumissions
          </Link>
          <LogoutButton />
        </nav>
      </header>
      <main {...stylex.props(styles.main)}>{children}</main>
    </div>
  );
}
