import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "./session";

/** Garde des routes API admin : 401 si la session n'est pas ouverte. */
export async function requireAdmin(): Promise<NextResponse | null> {
  if (await isAdminAuthenticated()) return null;
  return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
}
