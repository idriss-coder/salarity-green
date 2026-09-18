"use client";

import * as stylex from "@stylexjs/stylex";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Brand } from "@/components/layout/Brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { colors, radius } from "@/lib/tokens.stylex";

const styles = stylex.create({
  page: {
    alignItems: "center",
    display: "flex",
    justifyContent: "center",
    minHeight: "100dvh",
    paddingInline: "1rem",
  },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderStyle: "solid",
    borderWidth: "1px",
    display: "grid",
    gap: "1.25rem",
    maxWidth: "24rem",
    padding: "2rem",
    width: "100%",
  },
  title: {
    fontFamily: "var(--font-display)",
    fontSize: "1.25rem",
    fontWeight: 700,
    textTransform: "uppercase",
  },
  field: { display: "grid", gap: "0.4rem" },
  error: { color: colors.destructive, fontSize: "0.9rem" },
});

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(undefined);
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (response.ok) {
      const next = params.get("next");
      router.push(next && next.startsWith("/admin") ? next : "/admin");
      router.refresh();
      return;
    }
    setError(((await response.json()) as { error?: string }).error ?? "Connexion impossible");
    setPending(false);
  }

  return (
    <main {...stylex.props(styles.page)}>
      <form onSubmit={onSubmit} {...stylex.props(styles.card)}>
        <Brand />
        <h1 {...stylex.props(styles.title)}>Espace Solarity</h1>
        <div {...stylex.props(styles.field)}>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div {...stylex.props(styles.field)}>
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error ? (
          <p role="alert" {...stylex.props(styles.error)}>
            {error}
          </p>
        ) : null}
        <Button type="submit" disabled={pending}>
          {pending ? "Connexion…" : "Se connecter"}
        </Button>
      </form>
    </main>
  );
}
