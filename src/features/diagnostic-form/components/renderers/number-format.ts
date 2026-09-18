/** Saisie numérique tolérante : « 6 227 916 », « 1,5 », « 1.5 » → nombre ; chaîne vide → undefined. */
export function parseNumberInput(raw: string): number | undefined {
  const cleaned = raw.replace(/[\s  ]/g, "").replace(",", ".");
  if (cleaned === "" || cleaned === "." || cleaned === "-") return undefined;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : undefined;
}

/** Affichage groupé par milliers pendant la saisie d'un montant (entier). */
export function formatIntegerInput(value: number | undefined): string {
  if (value === undefined) return "";
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}
