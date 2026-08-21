import "server-only";

import { isValidEmail, readBoundedInteger } from "@/lib/application-validation";

export interface ApplicationControllerIdentity {
  name: string;
  address: string;
  email: string;
}

export interface ApplicationsConfig {
  allowedOrigins: readonly string[];
  consentVersion: string;
  controller: ApplicationControllerIdentity;
  ipHashSecret: string;
  rateLimitMax: number;
  rateLimitWindowMinutes: number;
  retentionDays: number;
  site: string;
  storageBucket: "cvs";
}

function readTrimmed(name: string, maxLength: number): string | null {
  const value = process.env[name]?.trim();
  return value && value.length <= maxLength ? value : null;
}

function readHttpsUrl(name: string, allowPath: boolean): URL | null {
  const raw = readTrimmed(name, 2_048);
  if (!raw) {
    return null;
  }

  try {
    const value = new URL(raw);
    if (
      value.protocol !== "https:" ||
      value.username ||
      value.password ||
      value.hash ||
      (!allowPath && (value.pathname !== "/" || value.search))
    ) {
      return null;
    }
    return value;
  } catch {
    return null;
  }
}

export function getApplicationControllerIdentity(): ApplicationControllerIdentity | null {
  const name = readTrimmed("APPLICATIONS_CONTROLLER_NAME", 160);
  const address = readTrimmed("APPLICATIONS_CONTROLLER_ADDRESS", 320);
  const email = readTrimmed("APPLICATIONS_CONTROLLER_EMAIL", 254);

  if (!name || !address || !email || !isValidEmail(email)) {
    return null;
  }

  return { name, address, email };
}

export function getApplicationsConfig(): ApplicationsConfig | null {
  if (process.env.APPLICATIONS_ENABLED !== "true") {
    return null;
  }

  const controller = getApplicationControllerIdentity();
  const allowedOriginUrl = readHttpsUrl("APPLICATIONS_ALLOWED_ORIGIN", false);
  const ipHashSecret = readTrimmed("APPLICATIONS_IP_HASH_SECRET", 512);
  const consentVersion = readTrimmed("APPLICATIONS_CONSENT_VERSION", 64);
  const retentionDays = readBoundedInteger(process.env.APPLICATIONS_RETENTION_DAYS, 90, 1, 365);
  const rateLimitMax = readBoundedInteger(process.env.APPLICATIONS_RATE_LIMIT_MAX, 3, 1, 20);
  const rateLimitWindowMinutes = readBoundedInteger(
    process.env.APPLICATIONS_RATE_LIMIT_WINDOW_MINUTES,
    60,
    1,
    24 * 60
  );

  if (
    !controller ||
    !allowedOriginUrl ||
    !ipHashSecret ||
    ipHashSecret.length < 32 ||
    !consentVersion ||
    retentionDays === null ||
    rateLimitMax === null ||
    rateLimitWindowMinutes === null ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return null;
  }

  const alternateHostname = allowedOriginUrl.hostname.startsWith("www.")
    ? allowedOriginUrl.hostname.slice(4)
    : `www.${allowedOriginUrl.hostname}`;
  const alternateOrigin = `${allowedOriginUrl.protocol}//${alternateHostname}`;

  return {
    allowedOrigins: [allowedOriginUrl.origin, alternateOrigin],
    consentVersion,
    controller,
    ipHashSecret,
    rateLimitMax,
    rateLimitWindowMinutes,
    retentionDays,
    site: allowedOriginUrl.hostname.replace(/^www\./, ""),
    storageBucket: "cvs",
  };
}

export function areApplicationsAvailable(): boolean {
  return getApplicationsConfig() !== null;
}
