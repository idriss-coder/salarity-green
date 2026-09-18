import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { pdfFileName } from "@/lib/submissions/create-submission";
import { getSubmissionPdf } from "@/lib/submissions/queries";

export const dynamic = "force-dynamic";

/** PDF d'une soumission pour l'admin : `?inline=1` pour l'aperçu, sinon téléchargement. */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const pdf = await getSubmissionPdf((await params).id);
  if (!pdf) return NextResponse.json({ error: "Rapport introuvable" }, { status: 404 });
  const inline = new URL(request.url).searchParams.get("inline") === "1";
  const fileName = pdfFileName(pdf.companyName, pdf.createdAt);
  return new NextResponse(new Uint8Array(pdf.bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(pdf.bytes.length),
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${fileName}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
