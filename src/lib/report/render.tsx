import { renderToBuffer } from "@react-pdf/renderer";
import type { EngineInput, Snapshot } from "@/lib/engine";
import { ReportDocument } from "./ReportDocument";
import { registerFonts } from "./resources";
import { buildViewModel } from "./view-model";

export interface RenderOptions {
  /** Date figée dans les métadonnées du PDF ; passée explicitement pour un rendu reproductible. */
  generatedAt: Date;
}

/** Snapshot + entrées → PDF (Buffer). Même snapshot et même date ⇒ même fichier. */
export async function renderReport(
  snapshot: Snapshot,
  input: EngineInput,
  options: RenderOptions,
): Promise<Buffer> {
  registerFonts();
  const vm = buildViewModel(snapshot, {
    companyName: input.company.name,
    unit: input.production.unit,
    ratePerHour: input.production.ratePerHour,
    marginPerUnit: input.production.marginPerUnit,
    generatedAt: options.generatedAt,
  });
  const buffer = await renderToBuffer(<ReportDocument vm={vm} />);
  return Buffer.from(buffer);
}
