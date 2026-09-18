import { getIronSession } from "iron-session";
import { NextResponse, type NextRequest } from "next/server";
import type { AdminSession } from "@/lib/auth/session";

/**
 * Garde des pages /admin : redirige vers /admin/login sans session.
 * Les routes API admin font leur propre contrôle (requireAdmin), ce proxy ne couvre que les pages.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();

  const secret = process.env.SESSION_SECRET;
  if (!secret) return NextResponse.redirect(new URL("/admin/login", request.url));

  // RequestCookies suffit en lecture ; iron-session exige un `set` à trois arguments que le proxy n'utilise jamais.
  const cookieStore = { get: (name: string) => request.cookies.get(name), set: () => undefined };
  const session = await getIronSession<AdminSession>(cookieStore, {
    password: secret,
    cookieName: "sgr_admin",
  });
  if (!session.email) {
    const login = new URL("/admin/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
