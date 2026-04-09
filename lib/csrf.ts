/**
 * Signed double-submit CSRF token.
 *
 * A token is `<random>.<hmac>` where `<hmac> = HMAC-SHA256(secret, random)`.
 * The same value is placed in a non-HttpOnly cookie and must be echoed back
 * in the `x-csrf-token` header on state-changing requests. Both the header
 * must match the cookie AND the HMAC must verify against CSRF_SECRET.
 *
 * This uses Web Crypto (globalThis.crypto) so it works in both Node and
 * Edge runtimes.
 */

const COOKIE_NAME = "ecm-csrf";
const HEADER_NAME = "x-csrf-token";
const TOKEN_TTL_SECONDS = 60 * 60 * 2; // 2 hours

function getSecret(): string {
  const secret = process.env.CSRF_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "CSRF_SECRET env var must be set and at least 32 characters long"
    );
  }
  return secret;
}

function b64urlEncode(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmac(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(data)
  );
  return b64urlEncode(new Uint8Array(sig));
}

/** Constant-time string comparison. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/** Generate a new signed CSRF token. */
export async function generateCsrfToken(): Promise<string> {
  const random = new Uint8Array(24);
  crypto.getRandomValues(random);
  const randomB64 = b64urlEncode(random);
  const sig = await hmac(getSecret(), randomB64);
  return `${randomB64}.${sig}`;
}

/** Verify a token: returns true only if format + HMAC + identity check pass. */
export async function verifyCsrfToken(
  headerToken: string | null | undefined,
  cookieToken: string | null | undefined
): Promise<boolean> {
  if (!headerToken || !cookieToken) return false;
  if (!safeEqual(headerToken, cookieToken)) return false;

  const parts = headerToken.split(".");
  if (parts.length !== 2) return false;
  const [random, sig] = parts;
  if (!random || !sig) return false;

  let expected: string;
  try {
    expected = await hmac(getSecret(), random);
  } catch {
    return false;
  }
  return safeEqual(sig, expected);
}

export const CSRF_COOKIE_NAME = COOKIE_NAME;
export const CSRF_HEADER_NAME = HEADER_NAME;
export const CSRF_COOKIE_MAX_AGE = TOKEN_TTL_SECONDS;
