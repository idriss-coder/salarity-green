import { NextResponse } from "next/server";
import { z } from "zod";
import { checkAdminCredentials, getAdminSession } from "@/lib/auth/session";

const bodySchema = z.object({ email: z.string().min(1), password: z.string().min(1) });

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Identifiants requis" }, { status: 400 });

  const { email, password } = parsed.data;
  if (!checkAdminCredentials(email, password)) {
    // Même délai qu'un succès pour ne pas révéler quel champ est faux.
    await new Promise((r) => setTimeout(r, 400));
    return NextResponse.json({ error: "Identifiants incorrects" }, { status: 401 });
  }

  const session = await getAdminSession();
  session.email = email.trim().toLowerCase();
  session.loggedInAt = Date.now();
  await session.save();
  return NextResponse.json({ ok: true });
}
