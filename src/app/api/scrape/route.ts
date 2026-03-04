import { NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export async function POST(request: Request) {
  // Basic protection — only allow in development or with a secret
  const secret = request.headers.get("x-scrape-secret");
  const isDev = process.env.NODE_ENV === "development";

  if (!isDev && secret !== process.env.SCRAPE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const quick = (body as Record<string, unknown>).quick === true;

  try {
    const cwd = process.cwd();
    const pythonBin = `${cwd}/scripts/.venv/bin/python`;
    const script = `${cwd}/scripts/scrape-jobs.py`;
    const args = quick ? ["--quick", "--results", "10"] : ["--results", "25"];

    const { stdout, stderr } = await execFileAsync(pythonBin, [script, ...args], {
      timeout: 300_000,
      cwd,
      env: {
        ...process.env,
        SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
      },
    });

    return NextResponse.json({
      success: true,
      output: stdout,
      warnings: stderr || null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
