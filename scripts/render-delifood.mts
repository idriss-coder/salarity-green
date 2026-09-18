/**
 * Rend le rapport DELIFOOD de référence dans out/delifood.pdf pour comparaison visuelle avec le modèle.
 * Usage : pnpm tsx scripts/render-delifood.mts
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { computeSnapshot } from "../src/lib/engine";
import { delifoodInput } from "../src/lib/engine/fixtures/delifood";
import { renderReport } from "../src/lib/report/render";

async function main() {
  const snapshot = computeSnapshot(delifoodInput);
  const started = Date.now();
  const pdf = await renderReport(snapshot, delifoodInput, {
    generatedAt: new Date("2026-09-18T00:00:00Z"),
  });
  mkdirSync("out", { recursive: true });
  writeFileSync("out/delifood.pdf", pdf);
  console.log(
    `out/delifood.pdf : ${(pdf.length / 1024).toFixed(0)} Ko en ${Date.now() - started} ms`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
