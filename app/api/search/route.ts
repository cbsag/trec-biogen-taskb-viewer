import { type NextRequest, NextResponse } from "next/server";

import {
  searchTopics,
  selectedSystemIds,
  serializeSearchResult,
} from "@/lib/api-data";

export function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!query) {
    return NextResponse.json(
      { error: "Provide a non-empty ?q= search term." },
      { status: 400 },
    );
  }

  const systemIds = selectedSystemIds(
    request.nextUrl.searchParams.get("systems"),
  );
  const selectedNames = systemIds.map((id) => `System ${id}`);
  const results = searchTopics(query).map((topic) =>
    serializeSearchResult(topic, systemIds),
  );

  return NextResponse.json({
    results,
    count: results.length,
    systems: selectedNames,
  });
}
