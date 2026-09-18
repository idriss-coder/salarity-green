import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { deleteSubmission, getSubmission } from "@/lib/submissions/queries";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const detail = await getSubmission((await params).id);
  if (!detail) return NextResponse.json({ error: "Soumission introuvable" }, { status: 404 });
  return NextResponse.json(detail);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const deleted = await deleteSubmission((await params).id);
  if (!deleted) return NextResponse.json({ error: "Soumission introuvable" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
