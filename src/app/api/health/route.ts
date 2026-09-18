import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db/mongoose";

export const dynamic = "force-dynamic";

/** Vérifie que l'application tourne et que MongoDB répond. */
export async function GET() {
  try {
    const db = await connectDb();
    const ping = await db.connection.db?.admin().ping();
    return NextResponse.json({ ok: true, db: ping?.ok === 1 ? "up" : "unknown" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    return NextResponse.json({ ok: false, db: "down", error: message }, { status: 503 });
  }
}
