import { type NextRequest, NextResponse } from "next/server";

import { searchPubMed } from "@/lib/pubmed";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const sentence =
    request.nextUrl.searchParams.get("sentence")?.trim().slice(0, 2_000) ?? "";
  const requestedLimit = Number.parseInt(
    request.nextUrl.searchParams.get("retmax") ?? "5",
    10,
  );
  const limit = Number.isFinite(requestedLimit)
    ? Math.min(Math.max(requestedLimit, 1), 20)
    : 5;

  if (!sentence) {
    return NextResponse.json(
      { error: "Provide text with ?sentence=." },
      { status: 400 },
    );
  }

  try {
    const result = await searchPubMed(sentence, limit);
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=1800",
      },
    });
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
