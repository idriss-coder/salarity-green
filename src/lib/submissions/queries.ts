import { isValidObjectId } from "mongoose";
import { connectDb } from "@/lib/db/mongoose";
import { Submission } from "@/lib/db/models/submission";
import type { Snapshot } from "@/lib/engine";
import type { Answers } from "@/features/diagnostic-form/definition/types";

/** Ligne du tableau admin : uniquement ce qu'il faut pour lister. */
export interface SubmissionSummary {
  id: string;
  createdAt: string;
  email: string;
  companyName: string;
  sector: string;
  city: string;
  baselineTotal: number;
  recommendedScenario: string;
  paybackYearsHundredths: number | null;
  warningsCount: number;
}

export interface SubmissionDetail extends SubmissionSummary {
  contactName?: string;
  engineVersion: string;
  schemaVersion: number;
  answers: Answers;
  snapshot: Snapshot;
  pdf: { size: number; sha256: string; generatedAt: string };
}

function summarize(doc: {
  _id: unknown;
  createdAt: Date;
  email: string;
  company: { name: string; sector: string; city: string };
  snapshot: Snapshot;
}): SubmissionSummary {
  const snapshot = doc.snapshot;
  const recommended = snapshot.scenarios.find((s) => s.key === snapshot.recommendation.scenarioKey);
  return {
    id: String(doc._id),
    createdAt: doc.createdAt.toISOString(),
    email: doc.email,
    companyName: doc.company.name,
    sector: doc.company.sector,
    city: doc.company.city,
    baselineTotal: snapshot.baseline.total,
    recommendedScenario: recommended?.label ?? snapshot.recommendation.scenarioKey,
    paybackYearsHundredths: recommended?.paybackYearsHundredths ?? null,
    warningsCount: snapshot.baseline.warnings.length,
  };
}

export async function listSubmissions(
  options: { search?: string; limit?: number } = {},
): Promise<SubmissionSummary[]> {
  await connectDb();
  const filter = options.search
    ? {
        $or: [
          { "company.name": { $regex: options.search, $options: "i" } },
          { email: { $regex: options.search, $options: "i" } },
        ],
      }
    : {};
  const docs = await Submission.find(filter)
    .select("createdAt email company snapshot")
    .sort({ createdAt: -1 })
    .limit(options.limit ?? 200)
    .lean();
  return docs.map((d) => summarize(d as Parameters<typeof summarize>[0]));
}

export async function getSubmission(id: string): Promise<SubmissionDetail | null> {
  if (!isValidObjectId(id)) return null;
  await connectDb();
  const doc = await Submission.findById(id).select("-pdf.data -downloadToken").lean();
  if (!doc || !doc.company || !doc.pdf) return null;
  const summary = summarize(doc as Parameters<typeof summarize>[0]);
  return {
    ...summary,
    contactName: doc.company.contactName ?? undefined,
    engineVersion: doc.engineVersion,
    schemaVersion: doc.schemaVersion,
    answers: doc.answers as Answers,
    snapshot: doc.snapshot as Snapshot,
    pdf: {
      size: doc.pdf.size,
      sha256: doc.pdf.sha256,
      generatedAt: (doc.pdf.generatedAt as Date).toISOString(),
    },
  };
}

export async function deleteSubmission(id: string): Promise<boolean> {
  if (!isValidObjectId(id)) return false;
  await connectDb();
  const res = await Submission.deleteOne({ _id: id });
  return res.deletedCount > 0;
}

export async function getSubmissionPdf(
  id: string,
): Promise<{ bytes: Buffer; companyName: string; createdAt: Date } | null> {
  if (!isValidObjectId(id)) return null;
  await connectDb();
  const doc = await Submission.findById(id).select("pdf.data company.name createdAt").lean();
  if (!doc || !doc.company || !doc.pdf) return null;
  const data = doc.pdf.data as unknown;
  const bytes = Buffer.isBuffer(data)
    ? data
    : Buffer.from((data as { buffer: ArrayBuffer }).buffer);
  return { bytes, companyName: doc.company.name, createdAt: doc.createdAt as Date };
}
