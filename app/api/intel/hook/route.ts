import { NextResponse } from "next/server";
import { isValidSignature, SIGNATURE_HEADER_NAME } from "@sanity/webhook";
import { enrichArticle } from "@/lib/intel/process";

/**
 * Sanity webhook receiver for the Content Intelligence Engine.
 *
 * Configured in the Sanity dashboard on `intelArticle` create events. The
 * payload carries { _id, _type, status } and we kick off enrichment when
 * status === "raw".
 *
 * The signature is verified with SANITY_WEBHOOK_SECRET before any work
 * happens. The handler returns 200 synchronously — the enrichment runs
 * fire-and-forget. For longer processing, move the call into a Netlify
 * Background Function.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Payload = {
  _id?: string;
  _type?: string;
  status?: string;
};

export async function POST(req: Request) {
  const secret = process.env.SANITY_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  const body = await req.text();
  const signature = req.headers.get(SIGNATURE_HEADER_NAME) ?? "";

  const valid = await isValidSignature(body, signature, secret);
  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: Payload;
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (payload._type !== "intelArticle" || !payload._id) {
    return NextResponse.json({ ok: true, skipped: "not-an-article" });
  }

  if (payload.status === "raw") {
    // Fire-and-forget. Errors surface in server logs; the article stays
    // status="raw" and the next hook invocation will retry.
    enrichArticle(payload._id).catch((err) => {
      console.error("[intel/hook] enrichArticle failed", payload._id, err);
    });
  }

  return NextResponse.json({ ok: true });
}
