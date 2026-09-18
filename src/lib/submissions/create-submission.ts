import { createHash } from "node:crypto";
import { answersSchema } from "@/features/diagnostic-form/definition/schema";
import { toEngineInput } from "@/features/diagnostic-form/definition/to-engine-input";
import { formDefinition } from "@/features/diagnostic-form/definition/form.definition";
import { generateDownloadToken, signDownloadToken } from "@/lib/auth/download-token";
import { connectDb } from "@/lib/db/mongoose";
import { Submission } from "@/lib/db/models/submission";
import { computeSnapshot, ENGINE_VERSION } from "@/lib/engine";
import { renderReport } from "@/lib/report/render";

export class ValidationError extends Error {
  constructor(public readonly issues: Array<{ path: string; message: string }>) {
    super("Réponses invalides");
  }
}

/**
 * Pipeline complet d'une soumission : valider → calculer → rendre le PDF → sauvegarder.
 * Retourne l'identifiant et l'URL de téléchargement signée.
 */
export async function createSubmission(rawAnswers: unknown, now = new Date()) {
  const parsed = answersSchema.safeParse(rawAnswers);
  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    );
  }
  const answers = parsed.data;
  const input = toEngineInput(answers);
  const snapshot = computeSnapshot(input);
  const pdf = await renderReport(snapshot, input, { generatedAt: now });
  const downloadToken = generateDownloadToken();

  await connectDb();
  const doc = await Submission.create({
    schemaVersion: formDefinition.version,
    engineVersion: ENGINE_VERSION,
    email: String(answers["contact.email"]),
    company: {
      name: input.company.name,
      sector: input.company.sector,
      city: input.company.city,
      contactName: input.company.contactName,
    },
    answers,
    snapshot,
    pdf: {
      data: pdf,
      size: pdf.length,
      sha256: createHash("sha256").update(pdf).digest("hex"),
      generatedAt: now,
    },
    downloadToken,
  });

  const id = doc._id.toString();
  return {
    id,
    downloadUrl: `/api/submissions/${id}/pdf?token=${downloadToken}&sig=${signDownloadToken(id, downloadToken)}`,
  };
}

export function pdfFileName(companyName: string, date: Date): string {
  const slug = companyName
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
  return `diagnostic-energetique-${slug || "rapport"}-${date.toISOString().slice(0, 10)}.pdf`;
}
