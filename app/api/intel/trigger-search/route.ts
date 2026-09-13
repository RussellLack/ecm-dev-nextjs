import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type, x-intel-secret",
    "Access-Control-Max-Age": "300",
  };
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

const GH_OWNER = "RussellLack";
const GH_REPO = "ecm-dev-intel-studio";
const GH_SEARCH_WORKFLOW = "intel-search.yml";

export async function POST(req: NextRequest) {
  const secret = process.env.INTEL_TO_BLOG_SECRET?.trim();
  if (!secret) {
    return NextResponse.json({ error: "Server misconfiguration: INTEL_TO_BLOG_SECRET not set" }, { status: 500, headers: corsHeaders() });
  }
  const incoming = req.headers.get("x-intel-secret") ?? "";
  if (incoming !== secret) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401, headers: corsHeaders() });
  }
  const ghToken = process.env.GH_DISPATCH_TOKEN?.trim();
  if (!ghToken) {
    return NextResponse.json({ error: "Server misconfiguration: GH_DISPATCH_TOKEN not set" }, { status: 500, headers: corsHeaders() });
  }
  let query = "";
  let maxResults = 20;
  try {
    const body = await req.json().catch(() => ({}));
    if (typeof body.query === "string") query = body.query.trim();
    if (typeof body.maxResults === "number" && body.maxResults > 0) maxResults = body.maxResults;
  } catch { /* proceed with defaults */ }
  const inputs: Record<string, string> = { max_results: String(maxResults) };
  if (query) inputs.query = query;
  const dispatchUrl = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/actions/workflows/${GH_SEARCH_WORKFLOW}/dispatches`;
  const r = await fetch(dispatchUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ghToken}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({ ref: "main", inputs }),
  });
  if (!r.ok) {
    const errBody = await r.text().catch(() => "");
    return NextResponse.json({ error: `GitHub dispatch failed: HTTP ${r.status} ${errBody.slice(0, 300)}` }, { status: 502, headers: corsHeaders() });
  }
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}
