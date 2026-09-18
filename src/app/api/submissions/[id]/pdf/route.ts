import { isValidObjectId } from "mongoose";
import { NextResponse } from "next/server";
import { verifyDownloadSignature } from "@/lib/auth/download-token";
import { connectDb } from "@/lib/db/mongoose";
import { Submission } from "@/lib/db/models/submission";
import { pdfFileName } from "@/lib/submissions/create-submission";
import { getSubmissionPdf } from "@/lib/submissions/queries";

export const dynamic = "force-dynamic";

/** Téléchargement du PDF par le client, via le lien signé remis sur la page Merci. */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const url = new URL(request.url);
  const token = url.searchParams.get("token") ?? "";
  const sig = url.searchParams.get("sig") ?? "";

  if (!isValidObjectId(id) || !token || !sig || !verifyDownloadSignature(id, token, sig)) {
    return NextResponse.json({ error: "Lien invalide" }, { status: 403 });
  }

  await connectDb();
  const owned = await Submission.exists({ _id: id, downloadToken: token });
  if (!owned) return NextResponse.json({ error: "Rapport introuvable" }, { status: 404 });
  const pdf = await getSubmissionPdf(id);
  if (!pdf) return NextResponse.json({ error: "Rapport introuvable" }, { status: 404 });

  return new NextResponse(new Uint8Array(pdf.bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(pdf.bytes.length),
      "Content-Disposition": `attachment; filename="${pdfFileName(pdf.companyName, pdf.createdAt)}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
