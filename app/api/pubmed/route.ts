import { type NextRequest, NextResponse } from "next/server";

import { fetchPubMedArticles } from "@/lib/pubmed";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const pmids = [
    ...new Set(
      (request.nextUrl.searchParams.get("pmids") ?? "")
        .split(/[,\s]+/)
        .filter((value) => /^\d{5,9}$/.test(value)),
    ),
  ].slice(0, 20);

  if (!pmids.length) {
    return NextResponse.json(
      { error: "Provide one or more PubMed IDs with ?pmids=123,456." },
      { status: 400 },
    );
  }

  try {
    const items = await fetchPubMedArticles(pmids);
    return NextResponse.json(
      { count: items.length, items },
      {
        headers: {
          "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600",
        },
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "PubMed request failed.",
      },
      { status: 502 },
    );
  }
}
