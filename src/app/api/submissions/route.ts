import { NextResponse } from "next/server";
import { createSubmission, ValidationError } from "@/lib/submissions/create-submission";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/** Soumission du formulaire : réponses brutes → rapport généré et sauvegardé. */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }

  try {
    const result = await createSubmission(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message, issues: error.issues }, { status: 422 });
    }
    console.error("[submissions] échec", error);
    return NextResponse.json(
      { error: "La génération du rapport a échoué. Réessayez dans un instant." },
      { status: 500 },
    );
  }
}
