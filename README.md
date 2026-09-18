# Solarity Green Report

Plateforme de diagnostic énergétique : un formulaire immersif collecte les données d'un site industriel, un moteur de calcul déterministe chiffre le coût annuel de l'instabilité électrique et compare trois scénarios solaires, puis un rapport PDF de 9 pages (format du modèle BEG) est généré automatiquement. Un mini-admin permet de consulter les soumissions et de télécharger les rapports.

Plan détaillé : [`docs/MVP-PLAN.md`](docs/MVP-PLAN.md).

## Stack

- Next.js 16 (App Router, **mode webpack** — imposé par StyleX), TypeScript, pnpm
- UI : StyleX + Base UI via le registre [shadcn-cssinjs](https://www.shadcn-cssinjs.com), Motion
- Calcul : TypeScript pur (`src/lib/engine`), tests Vitest
- PDF : `@react-pdf/renderer` (`src/lib/report`)
- Base : MongoDB Atlas (M0) + Mongoose
- Admin : compte unique défini en variables d'environnement, session `iron-session`

## Démarrer

```bash
pnpm install
cp .env.example .env.local   # puis renseigner les valeurs
pnpm dev                      # http://localhost:3000
```

Scripts : `pnpm build`, `pnpm test`, `pnpm typecheck`, `pnpm format`, `pnpm tsx scripts/render-delifood.mts` (rend le rapport de référence dans `out/delifood.pdf`).

Ajouter un composant du registre StyleX (sans le CLI shadcn) : `node scripts/registry-add.mjs dialog select` — les dépendances de registre sont résolues et les fichiers copiés dans `src/components/ui/`.

> `next dev` et `next build` tournent avec `--webpack` : la compilation StyleX passe par Babel (`.babelrc`), ce que Turbopack ne supporte pas. Conséquence : `next/font` est indisponible, les polices sont servies depuis `public/fonts` via `@font-face`.
>
> Réseau lent vers registry.npmjs.org ? `NODE_OPTIONS=--dns-result-order=ipv6first pnpm install --prefer-offline` (IPv6 est nettement plus rapide sur certaines connexions).

## Variables d'environnement

| Variable | Rôle |
|---|---|
| `MONGODB_URI` | Chaîne de connexion Atlas |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Identifiants du mini-admin |
| `SESSION_SECRET` | Signature du cookie de session admin (≥ 32 car.) |
| `DOWNLOAD_TOKEN_SECRET` | Signature des liens de téléchargement client (≥ 32 car.) |

## Arborescence

```
src/
  app/            routes (formulaire, admin, API)
  components/ui/  composants StyleX installés depuis le registre
  features/       formulaire immersif (définition, moteur d'étapes, renderers)
  lib/
    engine/       moteur de calcul (baseline, scénarios, recommandation)
    report/       rapport PDF (pages, graphiques SVG, assets, polices)
    db/           connexion Mongoose et modèles
    config/       variables d'environnement validées
docs/             cadrage, modèle de rapport, plan MVP
```
