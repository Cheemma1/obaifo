import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALES, hasLocale } from "@/i18n/config";

/**
 * Every page lives under /ig or /en. Unprefixed URLs (including shared tale
 * links) are redirected to the visitor's saved language, or Igbo by default.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`))) return;

  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  const locale = hasLocale(saved) ? saved : DEFAULT_LOCALE;
  request.nextUrl.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  // Skip the API and upload proxies, Next internals and any file with an extension.
  matcher: ["/((?!api|uploads|_next|.*\\..*).*)"],
};
