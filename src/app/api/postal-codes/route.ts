import { NextResponse } from "next/server";
import { searchSwissPostalCodes } from "@/lib/swiss-postal-codes";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const limit = Number(searchParams.get("limit") ?? "14");

  const results = searchSwissPostalCodes(q, limit);
  return NextResponse.json(results, {
    headers: { "Cache-Control": "s-maxage=86400, stale-while-revalidate=604800" },
  });
}
