import { createHmac, randomUUID } from "node:crypto";

import { NextResponse } from "next/server";
import { getJobListingById } from "@/lib/job-catalog";
import { createAdminClient } from "@/lib/supabase";
import { getApplicationsConfig, type ApplicationsConfig } from "@/lib/applications-config";
import {
  MAX_APPLICATION_PDF_BYTES,
  MAX_APPLICATION_REQUEST_BYTES,
  hasDisallowedPdfFeatures,
  hasPdfMagic,
  isAcceptableFormAge,
  isAcceptedPdfMimeType,
  isValidEmail,
  isValidPdfFilename,
  isValidPhone,
  isValidPlainText,
} from "@/lib/application-validation";

export const runtime = "nodejs";

const ALLOWED_FIELDS = new Set([
  "jobId",
  "name",
  "email",
  "phone",
  "cv",
  "website",
  "formStartedAt",
  "consent",
]);

class InvalidApplicationRequest extends Error {}
class ApplicationRequestTooLarge extends Error {}

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    }
  );
}

function unavailableResponse() {
  return jsonError("Online-Bewerbungen sind derzeit nicht verfügbar.", 503);
}

function logFailure(event: string, requestId: string) {
  console.error("[applications] request failed", { event, requestId });
}

function isSameOrigin(request: Request, allowedOrigins: readonly string[]): boolean {
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  return Boolean(origin && allowedOrigins.includes(origin)) && (!fetchSite || fetchSite === "same-origin");
}

function getClientAddress(request: Request): string | null {
  const forwarded =
    request.headers.get("x-vercel-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for");
  const address = forwarded?.split(",", 1)[0]?.trim();
  return address && address.length <= 64 && !/[\u0000-\u0020\u007f]/.test(address)
    ? address
    : null;
}

function hashClientAddress(address: string, secret: string): string {
  return createHmac("sha256", secret).update(address, "utf8").digest("hex");
}

async function readRequestBody(request: Request): Promise<Buffer> {
  const contentLength = request.headers.get("content-length");
  if (contentLength) {
    if (!/^\d+$/.test(contentLength) || Number(contentLength) > MAX_APPLICATION_REQUEST_BYTES) {
      throw new ApplicationRequestTooLarge();
    }
  }

  if (!request.body) {
    throw new InvalidApplicationRequest();
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    totalBytes += value.byteLength;
    if (totalBytes > MAX_APPLICATION_REQUEST_BYTES) {
      await reader.cancel();
      throw new ApplicationRequestTooLarge();
    }
    chunks.push(value);
  }

  if (totalBytes === 0) {
    throw new InvalidApplicationRequest();
  }
  return Buffer.concat(chunks, totalBytes);
}

async function parseBoundedFormData(request: Request): Promise<FormData> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!/^multipart\/form-data;\s*boundary=/i.test(contentType)) {
    throw new InvalidApplicationRequest();
  }

  const body = await readRequestBody(request);
  const boundedRequest = new Request(request.url, {
    method: "POST",
    headers: { "content-type": contentType },
    body: Uint8Array.from(body).buffer,
  });
  const formData = await boundedRequest.formData();

  let entryCount = 0;
  for (const key of formData.keys()) {
    entryCount += 1;
    if (entryCount > ALLOWED_FIELDS.size || !ALLOWED_FIELDS.has(key)) {
      throw new InvalidApplicationRequest();
    }
  }
  return formData;
}

function getSingleString(formData: FormData, field: string): string {
  const values = formData.getAll(field);
  if (values.length !== 1 || typeof values[0] !== "string") {
    throw new InvalidApplicationRequest();
  }
  return values[0].normalize("NFKC").trim();
}

function getSingleFile(formData: FormData, field: string): File {
  const values = formData.getAll(field);
  if (values.length !== 1 || !(values[0] instanceof File)) {
    throw new InvalidApplicationRequest();
  }
  return values[0];
}

async function isRateLimited(
  config: ApplicationsConfig,
  ipHash: string
): Promise<"limited" | "allowed" | "unavailable"> {
  const windowStart = new Date(
    Date.now() - config.rateLimitWindowMinutes * 60 * 1_000
  ).toISOString();
  const { count, error } = await createAdminClient()
    .from("applications")
    .select("id", { count: "exact", head: true })
    .eq("site", config.site)
    .eq("ip_hash", ipHash)
    .gte("submitted_at", windowStart);

  if (error || count === null) return "unavailable";
  return count >= config.rateLimitMax ? "limited" : "allowed";
}

export async function POST(request: Request) {
  const requestId = randomUUID();
  const config = getApplicationsConfig();

  if (!config) return unavailableResponse();
  if (!isSameOrigin(request, config.allowedOrigins)) {
    return jsonError("Die Anfrage konnte nicht verarbeitet werden.", 403);
  }

  const clientAddress = getClientAddress(request);
  if (!clientAddress) {
    logFailure("client_address_unavailable", requestId);
    return unavailableResponse();
  }

  try {
    const formData = await parseBoundedFormData(request);
    const jobId = getSingleString(formData, "jobId");
    const name = getSingleString(formData, "name");
    const email = getSingleString(formData, "email").toLowerCase();
    const phone = getSingleString(formData, "phone");
    const website = getSingleString(formData, "website");
    const formStartedAt = getSingleString(formData, "formStartedAt");
    const consent = getSingleString(formData, "consent");
    const cv = getSingleFile(formData, "cv");
    const filename = cv.name.normalize("NFKC").trim();

    if (
      website !== "" ||
      consent !== "yes" ||
      !isAcceptableFormAge(formStartedAt) ||
      !/^[a-zA-Z0-9_-]{1,120}$/.test(jobId) ||
      !isValidPlainText(name, 100) ||
      !isValidEmail(email) ||
      !isValidPhone(phone) ||
      !isValidPdfFilename(filename) ||
      !isAcceptedPdfMimeType(cv.type) ||
      cv.size < 10 ||
      cv.size > MAX_APPLICATION_PDF_BYTES
    ) {
      return jsonError("Bitte prüfe deine Angaben und die PDF-Datei.", 400);
    }

    const ipHash = hashClientAddress(clientAddress, config.ipHashSecret);
    const rateLimit = await isRateLimited(config, ipHash);
    if (rateLimit === "unavailable") {
      logFailure("rate_limit_check_failed", requestId);
      return unavailableResponse();
    }
    if (rateLimit === "limited") {
      return jsonError("Zu viele Anfragen. Bitte versuche es später erneut.", 429);
    }

    const job = await getJobListingById({ id: jobId });
    if (!job) return jsonError("Diese Stelle ist nicht mehr verfügbar.", 404);

    const buffer = Buffer.from(await cv.arrayBuffer());
    if (!hasPdfMagic(buffer)) {
      return jsonError("Die PDF-Datei konnte nicht angenommen werden.", 400);
    }

    if (hasDisallowedPdfFeatures(buffer)) {
      return jsonError(
        "Diese PDF enthält ausführbare oder verschlüsselte Inhalte. Bitte exportiere den Lebenslauf ohne Passwortschutz und versuche es erneut.",
        400
      );
    }

    const now = new Date();
    const storagePath = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${randomUUID()}.pdf`;
    const supabase = createAdminClient();
    const { error: uploadError } = await supabase.storage
      .from(config.storageBucket)
      .upload(storagePath, buffer, {
        cacheControl: "0",
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      logFailure("storage_upload_failed", requestId);
      return unavailableResponse();
    }

    const retentionExpiresAt = new Date(
      now.getTime() + config.retentionDays * 24 * 60 * 60 * 1_000
    ).toISOString();
    const { error: insertError } = await supabase.from("applications").insert({
      job_id: jobId,
      name,
      email,
      phone,
      cv_path: storagePath,
      cv_filename: filename,
      source: "form",
      site: config.site,
      status: "received",
      consent_version: config.consentVersion,
      consented_at: now.toISOString(),
      retention_expires_at: retentionExpiresAt,
      ip_hash: ipHash,
      submitted_at: now.toISOString(),
    });

    if (insertError) {
      const { error: cleanupError } = await supabase.storage
        .from(config.storageBucket)
        .remove([storagePath]);
      logFailure(cleanupError ? "application_insert_and_cleanup_failed" : "application_insert_failed", requestId);
      return unavailableResponse();
    }

    return NextResponse.json(
      { success: true },
      {
        status: 202,
        headers: {
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
        },
      }
    );
  } catch (error) {
    if (error instanceof ApplicationRequestTooLarge) {
      return jsonError("Die Anfrage oder PDF-Datei ist zu gross.", 413);
    }
    if (error instanceof InvalidApplicationRequest) {
      return jsonError("Die Anfrage konnte nicht verarbeitet werden.", 400);
    }

    logFailure("unexpected_failure", requestId);
    return unavailableResponse();
  }
}
