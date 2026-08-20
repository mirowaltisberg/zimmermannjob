import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Scraping is available only through the isolated CI publisher workflow." },
    { status: 410 },
  );
}
