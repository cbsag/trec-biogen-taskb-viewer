import { NextResponse } from "next/server";

import {
  legacySystemDescriptions,
  publicSystemSummary,
} from "@/lib/api-data";

export function GET() {
  return NextResponse.json({
    systems: publicSystemSummary().map((system) => system.name),
    descriptions: legacySystemDescriptions(),
    details: publicSystemSummary(),
  });
}
