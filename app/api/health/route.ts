import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    ok: true,
    service: "bioevidence-ai",
    data: "precomputed-trec-biogen-runs",
    pubmed: "available-on-demand",
  });
}
