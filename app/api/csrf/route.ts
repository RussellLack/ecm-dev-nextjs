/**
 * GET /api/csrf
 * Returns the visitor's CSRF token, setting it as a cookie when needed. The
 * client echoes the cookie value in the `x-csrf-token` header on POST.
 *
 * A valid signed token already in the cookie is returned as-is, without
 * resetting the cookie. Several components on a page (and other tabs) call
 * this, and minting a new token each time would invalidate the token any
 * earlier caller is still holding. The cookie keeps its original expiry, so a
 * token still lives at most CSRF_COOKIE_MAX_AGE.
 */
import { NextResponse, type NextRequest } from "next/server";
import {
  generateCsrfToken,
  isSignedCsrfToken,
  CSRF_COOKIE_NAME,
  CSRF_COOKIE_MAX_AGE,
} from "@/lib/csrf";

export async function GET(request: NextRequest) {
  try {
    const existing = request.cookies.get(CSRF_COOKIE_NAME)?.value;
    if (await isSignedCsrfToken(existing)) {
      return NextResponse.json({ token: existing });
    }

    const token = await generateCsrfToken();
    const response = NextResponse.json({ token });
    response.cookies.set({
      name: CSRF_COOKIE_NAME,
      value: token,
      httpOnly: false, // Client JS must read it to set the header
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: CSRF_COOKIE_MAX_AGE,
    });
    return response;
  } catch (err) {
    console.error("CSRF token generation failed:", err);
    return NextResponse.json(
      { error: "CSRF token unavailable" },
      { status: 500 }
    );
  }
}
