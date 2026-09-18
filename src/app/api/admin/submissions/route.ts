import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { listSubmissions } from "@/lib/submissions/queries";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const search = new URL(request.url).searchParams.get("q") ?? undefined;
  return NextResponse.json({ items: await listSubmissions({ search }) });
}
