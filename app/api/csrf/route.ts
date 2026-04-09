/**
 * GET /api/csrf
 * Issues a new signed CSRF token and sets it as a cookie. The client reads
 * the cookie and echoes the value in the `x-csrf-token` header on POST.
 */
import { NextResponse } from "next/server";
import {
  generateCsrfToken,
  CSRF_COOKIE_NAME,
  CSRF_COOKIE_MAX_AGE,
} from "@/lib/csrf";

export async function GET() {
  try {
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
