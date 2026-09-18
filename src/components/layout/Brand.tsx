import * as stylex from "@stylexjs/stylex";
import Image from "next/image";
import Link from "next/link";
import { colors } from "@/lib/tokens.stylex";
import logo from "@/lib/report/assets/logo-transparent.png";

const styles = stylex.create({
  link: {
    alignItems: "center",
    color: colors.foreground,
    display: "inline-flex",
    gap: "0.6rem",
    textDecoration: "none",
  },
  name: {
    fontFamily: "var(--font-display)",
    fontSize: "0.95rem",
    fontWeight: 800,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
  },
  sub: {
    color: colors.mutedForeground,
    fontSize: "0.65rem",
    letterSpacing: "0.3em",
    textTransform: "uppercase",
  },
  text: { display: "flex", flexDirection: "column", lineHeight: 1.1 },
});

/** Logo + nom, utilisé dans tous les en-têtes. */
export function Brand({ size = 36 }: { size?: number }) {
  return (
    <Link href="/" {...stylex.props(styles.link)}>
      <Image src={logo} alt="" width={size} height={size} priority />
      <span {...stylex.props(styles.text)}>
        <span {...stylex.props(styles.name)}>Solarity</span>
        <span {...stylex.props(styles.sub)}>Green</span>
      </span>
    </Link>
  );
}
