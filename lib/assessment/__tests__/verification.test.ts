// verification.test.ts: server-side bot checks for assessment completions.
// Runnable via Node 22.6+ native TS (no external runner, same style as the
// CMS engine tests):
//   node --experimental-strip-types lib/assessment/__tests__/verification.test.ts
//
// Cloudflare is replaced with a fake fetch, so every case is deterministic
// and each rejection is shown to come from its own layer.

import {
  verifyAssessmentCompletion,
  MIN_COMPLETION_MS,
  TURNSTILE_VERIFY_URL,
  type VerificationOutcome,
} from "../verification.ts";

let passed = 0;
function assert(cond: unknown, msg: string): void {
  if (!cond) throw new Error(`FAIL: ${msg}`);
  passed++;
}

const NOW = 1_800_000_000_000;
const SECRET = "test-secret";
const human = { startedAt: NOW - 60_000, website: "", turnstileToken: "good-token" };

interface Call { url: string; form: URLSearchParams }

/** Fake siteverify: accepts only "good-token". */
function fakeCloudflare(calls: Call[], mode: "normal" | "down" = "normal"): typeof fetch {
  return (async (url: string | URL | Request, init?: RequestInit) => {
    if (mode === "down") throw new TypeError("fetch failed");
    const form = init?.body as URLSearchParams;
    calls.push({ url: String(url), form });
    const success = form.get("response") === "good-token" && form.get("secret") === SECRET;
    return new Response(JSON.stringify({ success }), { status: 200 });
  }) as typeof fetch;
}

async function run(body: unknown, opts: { secret?: string; mode?: "normal" | "down"; ip?: string } = {}) {
  const calls: Call[] = [];
  const outcome = await verifyAssessmentCompletion(body, {
    secret: "secret" in opts ? opts.secret : SECRET,
    ip: opts.ip,
    now: NOW,
    fetchImpl: fakeCloudflare(calls, opts.mode),
  });
  return { outcome, calls };
}

const reason = (o: VerificationOutcome) => (o.qualified ? "qualified" : o.reason);

// Positive control: a real visitor qualifies, so every rejection below is
// caused by the one thing that case changes.
{
  const { outcome, calls } = await run(human, { ip: "203.0.113.7" });
  assert(outcome.qualified, `human completion should qualify, got ${reason(outcome)}`);
  assert(calls.length === 1 && calls[0]!.url === TURNSTILE_VERIFY_URL, "token checked with Cloudflare");
  assert(calls[0]!.form.get("remoteip") === "203.0.113.7", "visitor IP forwarded as remoteip");
}

// Acceptance case 1: completed faster than the minimum time.
{
  const { outcome, calls } = await run({ ...human, startedAt: NOW - 2_000 });
  assert(reason(outcome) === "too_fast", `2 second completion: expected too_fast, got ${reason(outcome)}`);
  assert(calls.length === 0, "too-fast completion never reaches Cloudflare");
}
{
  const { outcome } = await run({ ...human, startedAt: NOW - MIN_COMPLETION_MS });
  assert(outcome.qualified, "exactly the minimum time is allowed");
}

// Acceptance case 2: honeypot filled.
{
  const { outcome, calls } = await run({ ...human, website: "https://spam.example" });
  assert(reason(outcome) === "honeypot", `filled honeypot: expected honeypot, got ${reason(outcome)}`);
  assert(calls.length === 0, "honeypot hit never reaches Cloudflare");
}

// Acceptance case 3: invalid Turnstile token.
{
  const { outcome, calls } = await run({ ...human, turnstileToken: "invalid-token" });
  assert(reason(outcome) === "turnstile_failed", `invalid token: expected turnstile_failed, got ${reason(outcome)}`);
  assert(calls.length === 1, "invalid token was checked with Cloudflare");
}

// Fail-safe and malformed input.
{
  const { outcome } = await run(human, { mode: "down" });
  assert(reason(outcome) === "turnstile_unreachable", "Cloudflare unreachable counts nothing");
}
{
  const { outcome } = await run(human, { secret: undefined });
  assert(reason(outcome) === "no_secret", "missing TURNSTILE_SECRET_KEY counts nothing");
}
{
  const { outcome } = await run({ ...human, turnstileToken: "" });
  assert(reason(outcome) === "no_token", "missing token counts nothing");
}
for (const startedAt of [undefined, "1800000000000", Number.NaN, NOW - 2 * 24 * 60 * 60 * 1000]) {
  const { outcome } = await run({ ...human, startedAt });
  assert(reason(outcome) === "bad_timestamp", `startedAt ${String(startedAt)} is rejected`);
}
{
  const { outcome } = await run(null);
  assert(!outcome.qualified, "empty body counts nothing");
}

console.log(`verification.test.ts: ${passed} assertions passed`);
