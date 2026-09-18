import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import { getEnv } from "@/lib/config/env";

export interface AdminSession {
  email?: string;
  loggedInAt?: number;
}

function sessionOptions(): SessionOptions {
  return {
    password: getEnv().SESSION_SECRET,
    cookieName: "sgr_admin",
    cookieOptions: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 12, // 12 h
    },
  };
}

export async function getAdminSession() {
  return getIronSession<AdminSession>(await cookies(), sessionOptions());
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const session = await getAdminSession();
  return Boolean(session.email);
}

/** Comparaison à temps constant des identifiants avec le compte unique défini en env. */
export function checkAdminCredentials(email: string, password: string): boolean {
  const env = getEnv();
  return (
    timingSafeEqualString(email.trim().toLowerCase(), env.ADMIN_EMAIL.toLowerCase()) &&
    timingSafeEqualString(password, env.ADMIN_PASSWORD)
  );
}

function timingSafeEqualString(a: string, b: string): boolean {
  const encoder = new TextEncoder();
  const bufA = encoder.encode(a);
  const bufB = encoder.encode(b);
  let diff = bufA.length ^ bufB.length;
  for (let i = 0; i < Math.max(bufA.length, bufB.length); i += 1) {
    diff |= (bufA[i] ?? 0) ^ (bufB[i] ?? 0);
  }
  return diff === 0;
}
