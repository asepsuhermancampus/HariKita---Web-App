import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Redirect alias: /client/profile -> /client/profil
 */
export function GET(request: NextRequest) {
  return NextResponse.redirect(new URL("/client/profil", request.url), 307);
}
