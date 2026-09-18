/**
 * Arithmétique monétaire et de taux en entiers.
 * Les produits intermédiaires sont calculés en nombre flottant puis arrondis **une seule fois** par poste :
 * c'est la règle d'arrondi du rapport (les totaux sont des sommes d'entiers, donc exacts).
 */

export const BP_SCALE = 10_000;

/** Convertit un pourcentage décimal (48.5) en centièmes de pour cent (4850). */
export function pctToBp(pct: number): number {
  return Math.round(pct * 100);
}

/** Applique un taux (centièmes de %) à un montant et arrondit au franc. */
export function applyBp(amount: number, bp: number): number {
  return Math.round((amount * bp) / BP_SCALE);
}

/** Part complémentaire d'un taux : 1 − taux. */
export function complementBp(bp: number): number {
  return BP_SCALE - bp;
}

/** Arrondi au franc d'un produit de facteurs (dont certains décimaux). */
export function roundMoney(value: number): number {
  return Math.round(value);
}

/** Ratio a / b en centièmes de pour cent, arrondi. `null` si b = 0. */
export function ratioBp(a: number, b: number): number | null {
  if (b === 0) return null;
  return Math.round((a / b) * BP_SCALE);
}

/** Ratio a / b en centièmes (306 = 3,06). `null` si b ≤ 0. */
export function ratioHundredths(a: number, b: number): number | null {
  if (b <= 0) return null;
  return Math.round((a / b) * 100);
}

export function sum(values: number[]): number {
  return values.reduce((acc, v) => acc + v, 0);
}

/** Formatage FCFA avec espace insécable comme séparateur de milliers : 131 845 805. */
export function formatFcfa(amount: number, withUnit = true): string {
  const sign = amount < 0 ? "-" : "";
  const digits = Math.abs(Math.round(amount)).toString();
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");
  return `${sign}${grouped}${withUnit ? "\u00a0FCFA" : ""}`;
}

/** Formatage en millions : 131,85 M FCFA. `floor` tronque au lieu d'arrondir (« 131 M » pour 131,85 M). */
export function formatMillions(
  amount: number,
  decimals = 2,
  withUnit = true,
  floor = false,
): string {
  const scale = 10 ** decimals;
  const value = floor ? Math.floor((amount / 1_000_000) * scale) / scale : amount / 1_000_000;
  const m = value.toFixed(decimals).replace(".", ",");
  return `${m}\u00a0M${withUnit ? "\u00a0FCFA" : ""}`;
}

/** Formatage d'un taux en % : 4850 → « 48,5 % » ; 10000 → « 100 % ». */
export function formatBp(bp: number, decimals = 1): string {
  const pct = bp / 100;
  const text = Number.isInteger(pct) ? pct.toString() : pct.toFixed(decimals).replace(".", ",");
  return `${text}\u00a0%`;
}

/** Formatage d'un nombre décimal français à `decimals` décimales. */
export function formatNumber(value: number, decimals = 0): string {
  const [int, frac] = value.toFixed(decimals).split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");
  return frac ? `${grouped},${frac}` : grouped;
}
