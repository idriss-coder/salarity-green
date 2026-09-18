# Solarity Green Report — Plan MVP

Version 2.0 — 18 septembre 2026 (remplace la v1.0)
Sources : `docs/archi/conception-technique-diagnostic-energetique.docx` (cadrage) et `docs/output/Modèle de rapport BEG.pdf` (rapport DELIFOOD, 9 pages 16:9).

---

## 1. Objectif du MVP

**Valider que l'algorithme de génération du rapport fonctionne : 100 % généré, design identique au modèle PDF, données conformes.**

Parcours :

1. L'utilisateur arrive, remplit un **formulaire immersif** (une question — ou un petit groupe — par écran, type Typeform).
2. Dernier écran : **son email**, puis « Générer mon rapport ».
3. Le système **calcule** (baseline, 3 scénarios, recommandation), **génère le PDF** et **sauvegarde** tout (réponses, snapshot, PDF, email).
4. Un **mini-admin** (identifiant + mot de passe fixés en variables d'env) liste les soumissions, montre le détail et permet de **télécharger** le PDF. L'admin envoie lui-même le rapport au client (pas d'envoi d'email par la plateforme).

Contraintes : 2-3 utilisateurs, **zéro service payant**, aucune fonctionnalité au-delà de ce parcours.

### Hors périmètre (explicitement)
Envoi d'email, comptes clients, rôles, cycle de vie du dossier, validation humaine, devis, pièces jointes, OCR, relances, audit, PostgreSQL/Redis/S3/worker (stack du cadrage réservée à une phase ultérieure).

---

## 2. Décisions prises

| Sujet | Décision | Conséquence |
|---|---|---|
| Styling front | **StyleX** via le registre `shadcn-cssinjs.com` (composants shadcn sur Base UI) | `.babelrc` StyleX → Next.js en mode **webpack** (`--webpack`), pas de Turbopack. Tailwind reste dans le pipeline PostCSS (requis par le guide) mais les composants sont StyleX. |
| Animations | **Motion** (`motion`) | Transitions d'écran, barre de progression, micro-interactions |
| Moteur PDF | **@react-pdf/renderer** | Pur JS, serverless-friendly, SVG natif pour les graphiques, images de fond extraites du modèle |
| Facture électricité | **Moyenne mensuelle + nombre de mois**, avec saisie détaillée des 12 mois **optionnelle** | Deux chemins de calcul (`monthlyAverage` / `monthlyDetail`), même résultat structurel ; avertissement si < 12 mois |
| Investissement des scénarios | **Ratio × facture réseau annuelle**, calibré DELIFOOD (S1 2,1 · S2 3,5 · S3 6,5), affiché « estimatif » | Une constante par scénario dans `engine/config.ts`, remplaçable par une grille Solarity |
| Taux de réduction | Catalogue calibré DELIFOOD (cf. §5.2) | Idem, dans `engine/config.ts` |
| Police des titres | Anantason (Canva, non libre) → **Montserrat ExtraBold** ; corps **Open Sans** (celle du modèle) | Polices embarquées dans le PDF |
| Admin | Un seul compte : `ADMIN_EMAIL` + `ADMIN_PASSWORD` en env, session cookie signée (`iron-session`) | Pas de table utilisateurs |
| Gestionnaire de paquets | pnpm | — |

---

## 3. Stack

| Couche | Choix |
|---|---|
| App | Next.js 16 (App Router, webpack), TypeScript strict, pnpm |
| UI | StyleX 0.19 + Base UI + composants `shadcn-cssinjs`, Motion 13 |
| Formulaire | Définition déclarative + moteur d'étapes maison, Zod 4 (schémas partagés front/back) |
| Base | MongoDB Atlas M0, Mongoose 9 |
| Calcul | TypeScript pur (`src/lib/engine`), Vitest |
| PDF | @react-pdf/renderer 4, page 1440 × 810 pt |
| Auth admin | iron-session |
| Hébergement | Vercel Hobby |

---

## 4. Formulaire immersif — architecture

Référence UX : Typeform (une question par écran, grande typographie, focus automatique, `Entrée` pour avancer, transition verticale, barre de progression, retour arrière toujours possible). Pas de page-formulaire dense.

### 4.1 Le formulaire est une **donnée**, pas du JSX

```
src/features/diagnostic-form/
  definition/
    form.definition.ts      # sections → questions (id, type, label, help, unit, validation, showIf)
    conditions.ts           # helpers showIf : { field, equals } | { field, in } | fn
    schema.ts               # Zod par question + schéma complet dérivé de la définition
    defaults.ts             # valeurs « je ne sais pas » documentées
  engine/
    useFormEngine.ts        # état : réponses, index courant, questions visibles (filtrées par showIf), next/prev/goTo, validation de la question courante
    persistence.ts          # autosave/restauration localStorage (clé versionnée)
    progress.ts             # progression = questions visibles répondues / visibles
  components/
    FormShell.tsx           # layout plein écran, barre de progression, navigation clavier
    QuestionScreen.tsx      # anime l'entrée/sortie (Motion), titre, aide, renderer, bouton OK
    renderers/              # un composant par type de question, tous avec la même interface { question, value, onChange, onSubmit, error }
      TextRenderer.tsx  NumberRenderer.tsx (unité dans le champ)  CurrencyRenderer.tsx
      ChoiceRenderer.tsx (touches A/B/C)  YesNoRenderer.tsx  SelectRenderer.tsx
      MonthTableRenderer.tsx (12 mois, optionnel)  EmailRenderer.tsx  SummaryRenderer.tsx
    registry.ts             # map type → renderer
  index.ts
```

Règles : une question = un objet typé ; un type de question = un renderer ; les conditions ne sont jamais dans les composants ; le moteur est testable sans DOM ; la définition sert aussi à afficher les réponses brutes dans l'admin.

### 4.2 Sections et questions (~28 écrans, dont ~10 conditionnels)

| Section | Questions (type) | Condition |
|---|---|---|
| Entreprise | Nom (text) · Secteur (select) · Ville / pays (text) · Nom du contact (text) | — |
| Production | Produit (text) · Unité (select : sachet, kg, pièce, litre…) · Cadence, unités/heure (number) · Marge contributive par unité, FCFA (currency) · Heures de production/jour (number) · Jours/an (number) · Extension prévue ? (yesno) · Cadence cible (number) · Date cible (text) | cadence cible/date si extension = oui |
| Électricité | Montant moyen mensuel (currency) · Sur combien de mois (number 1-12) · « Je peux détailler mes 12 factures » (yesno) · Tableau 12 mois (monthTable) · Pénalité/dépassement facturé ? (yesno) · Montant mensuel moyen (currency) | tableau si détail = oui ; montant si pénalité = oui |
| Groupe électrogène | Avez-vous un groupe ? (yesno) · Mode de saisie : litres ou montant (choice) · Litres/mois (number) · Prix du litre (currency) · Montant/mois (currency) · Maintenance annuelle (currency) | toute la section si groupe = oui ; litres+prix ou montant selon le mode |
| Coupures | Fréquence : par jour / semaine / mois (choice + number) · Durée moyenne, min (number) · Part de la production arrêtée, % (number) · Part rattrapée plus tard, % (number) | — |
| Coûts cachés | Salariés sans tâche pendant les coupures ? (yesno) · Effectif (number) · Coût horaire chargé (currency) · Part non redéployée, % (number) · Matière perdue à chaque coupure ? (yesno) · Quantité par coupure (number) · Coût unitaire (currency) · Part non récupérable, % (number) · Pénalités/commandes perdues ? (yesno) · Montant annuel (currency) | chaque sous-bloc derrière sa porte |
| Projet | Objectifs (multi-choice) · Horizon d'analyse, années (number, défaut 10) | — |
| Fin | Récapitulatif annualisé (summary) · Email (email) → « Générer mon rapport » | — |
| Merci | Confirmation + bouton « Télécharger mon rapport » (lien signé) | — |

---

## 5. Moteur de calcul (`src/lib/engine`)

### 5.1 Baseline

Montants en FCFA entiers, arrondi par poste, taux en centièmes de % (entiers). Formules du §6 du cadrage.

| Poste | Type | Formule | Applicable si |
|---|---|---|---|
| Facture réseau | visible | détail : Σ mois saisis ; moyenne : moyenne × 12. Avertissement si < 12 mois | toujours |
| Consommation diesel | visible | litres/mois × prix × 12 **ou** montant/mois × 12 | groupe |
| Maintenance groupe | visible | montant annuel | groupe |
| Dépassement de puissance | visible | montant mensuel × 12 | pénalité |
| Pertes de production* | caché | coupures/an × durée(h) × cadence × marge × part arrêtée × (1 − rattrapage) | toujours |
| Matières perdues* | caché | coupures/an × quantité × coût × (1 − récupération) | matières |
| Personnel immobilisé* | caché | coupures/an × durée(h) × effectif × coût horaire × (1 − redéploiement) | personnel |
| Pénalités clients* | caché | montant annuel | pénalités |

Chaque `CostItem` porte : `key, label, category, applicable, amount, formulaLabel, formulaDetail, warnings[]` — la page 5 se rend directement depuis cette structure. Dérivés : coupures/an, heures d'arrêt/an, unités perdues/an, total, contexte futur (pertes recalculées à la cadence cible pour la page 3).

### 5.2 Scénarios (catalogue `engine/config.ts`)

| Scénario | Réseau | Pertes | Diesel | Puissance | Maint. | Personnel | Matières | Pénalités | Invest. |
|---|---|---|---|---|---|---|---|---|---|
| S1 Autoconsommation | −48,5 % | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 2,1 × facture |
| S2 Autoconsommation + stockage 5 h | −48,5 % | −100 % | −47,6 % | −100 % | −56 % | −100 % | −100 % | −100 % | 3,5 × facture |
| S3 Couverture totale | −100 % | −100 % | −99 % | −100 % | −93 % | −100 % | −100 % | −100 % | 6,5 × facture |

Indicateurs : résiduel par poste et total, économie annuelle, **délai de retour simple** (années), ROI à N ans (%), coût cumulé 0..N (courbe p.9), réduction totale (%).

### 5.3 Recommandation

Délai de retour le plus court parmi les scénarios à économie > 0 ; à égalité (± 0,25 an) → économie la plus élevée. Motifs générés depuis les métriques uniquement. DELIFOOD → S2, comme le modèle.

### 5.4 Golden test DELIFOOD

Baseline **exacte** (74 734 992 · 36 500 000 · 14 472 000 · 4 243 980 · 1 104 000 · 790 833 · **131 845 805**). Scénarios à ±1,5 % du modèle Canva (lui-même incohérent avec ses taux) : S1 4,36 ans, S2 3,06 ans, S3 3,72 ans. S2 recommandé.

---

## 6. Rapport PDF (`src/lib/report`)

Assets extraits du modèle (`pdfimages`) et versionnés dans `src/lib/report/assets/` : texture de fond verte (toutes pages), photo de couverture, technicien détouré, logo, illustration page 2. Polices embarquées : Montserrat ExtraBold (titres), Open Sans Regular/Bold (corps).

| Page | Composant | Source |
|---|---|---|
| 1 | `CoverPage` — titre « Énergie : un levier de compétitivité pour {entreprise} » | `company` |
| 2 | `WhyPage` — objectif, périmètre (cadence actuelle → cible), méthodologie | `answers` |
| 3 | `FindingsPage` — 5 constats générés | `baseline`, `future` |
| 4 | `CostChartPage` — barres horizontales SVG + hypothèse de marge | `baseline.items` |
| 5 | `CostTablePage` — Poste / Formule / Détail / Montant, total, astérisques, avertissements | `baseline.items` |
| 6 (n° 7) | `ScenarioTablePage` — réduction par poste × 3 scénarios | `scenarios` |
| 7 (n° 9) | `RoiPage` — courbe cumulée 10 ans SVG + tableau Invest./Résiduel/Économie/Délai de retour | `scenarios` |
| 8 (n° 11) | `RecommendationPage` | `recommendation` |
| 9 (n° 12) | `CommitmentsPage` — statique | — |

Numérotation des pages en pastille reprise du modèle (1, 2, 3, 4, 5, 7, 9, 11, 12). `renderReport(snapshot) → Buffer`, déterministe (même snapshot ⇒ même hash).

---

## 7. Données & API

```ts
// collection submissions
{ _id, createdAt, schemaVersion, engineVersion, email,
  company: { name, sector, city, contactName },
  answers: {...},                 // brut validé par Zod
  snapshot: { baseline, future, scenarios, recommendation, horizonYears },
  pdf: { data: Buffer, size, sha256, generatedAt },
  downloadToken }                 // lien client signé
```

| Route | Rôle |
|---|---|
| `POST /api/submissions` | valider → calculer → rendre le PDF → sauvegarder → `{ id, downloadUrl }` |
| `GET /api/submissions/[id]/pdf?token=` | téléchargement client (page Merci) |
| `POST /api/admin/login` · `POST /api/admin/logout` | compare `ADMIN_EMAIL`/`ADMIN_PASSWORD`, cookie iron-session |
| `GET /api/admin/submissions` · `GET /api/admin/submissions/[id]` · `GET …/[id]/pdf` | admin |

Admin : `/admin/login`, `/admin` (tableau : date, entreprise, email, total, scénario recommandé, délai de retour), `/admin/[id]` (réponses par section, tableaux du snapshot, aperçu PDF `<iframe>`, bouton Télécharger).

---

## 8. Lots

L'ordre place le cœur de valeur (moteur → PDF) en premier, testé sur DELIFOOD sans attendre l'UI.

| Lot | Livrable | Sortie vérifiable | Durée |
|---|---|---|---|
| **1 Socle** | Next 16 webpack + StyleX + registre shadcn-cssinjs + Motion + Vitest + Mongoose + env ; assets et polices du rapport extraits ; `README` | `pnpm build` et `pnpm test` verts, page d'accueil avec un composant StyleX, `/api/health` lit Mongo | ½ j |
| **2 Moteur** | `engine/` complet + golden DELIFOOD + tests d'applicabilité | 131 845 805, S2 recommandé | 1,5 j |
| **3 Rapport PDF** | 9 pages react-pdf + graphiques SVG + `scripts/render-delifood.ts` | `out/delifood.pdf` comparable page à page au modèle ; test « chaînes attendues présentes » | 2,5 j |
| **4 Données & API** | Définition du formulaire + Zod + modèle Mongo + `POST /api/submissions` + téléchargement | `curl` avec la fixture DELIFOOD → document en base avec PDF | 1 j |
| **5 Formulaire immersif** | Moteur d'étapes, renderers, Motion, autosave, récap, email, Merci | Parcours complet en ligne sur mobile et desktop | 2,5 j |
| **6 Mini-admin** | Login env, liste, détail, téléchargement | Un admin consulte et télécharge | 1 j |
| **7 Recette & prod** | 3 jeux de test, checklist §9, Vercel prod, Atlas prod | MVP en ligne | ½ j |

**≈ 9,5 jours-homme.** Chemin critique : 1 → 2 → 3 → 4. Les lots 5 et 6 peuvent commencer dès la fin du lot 4 (ou du 2 pour le lot 5, avec des données mockées).

---

## 9. Critères de recette

1. Le total du tableau (p.5), la somme des barres (p.4) et le chiffre de synthèse (p.3) sont identiques au franc près.
2. Le délai de retour p.9 et p.11 provient du même snapshot ; l'incohérence 2,1 vs 3,05 du modèle est impossible.
3. Un coût caché « non applicable » n'apparaît ni dans le total ni dans les scénarios ; la raison est visible dans l'admin.
4. Moins de 12 mois ⇒ avertissement dans le récapitulatif, le PDF (p.5) et l'admin.
5. DELIFOOD reproduit 131 845 805 FCFA et recommande S2.
6. Régénérer le PDF depuis le snapshot donne le même hash.
7. `/admin` inaccessible sans identifiants ; le lien de téléchargement client est signé et lié à une seule soumission.
8. Chaque page du PDF généré est visuellement conforme au modèle (fond, titres, pastille, tableaux, graphiques).
9. Parcours complet réalisable sur mobile.
