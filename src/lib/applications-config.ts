import "server-only";

import { isValidEmail, readBoundedInteger } from "@/lib/application-validation";

export interface ApplicationControllerIdentity {
  name: string;
  address: string;
  email: string;
}

export interface ApplicationsConfig {
  allowedOrigin: string;
  consentVersion: string;
  controller: ApplicationControllerIdentity;
  ipHashSecret: string;
  malwareScanToken: string;
  malwareScanUrl: string;
  rateLimitMax: number;
  rateLimitWindowMinutes: number;
  retentionDays: number;
  site: string;
  storageBucket: "cvs";
}

// No scanner vendor or trusted processing destination has been approved yet.
// Keep this false until a concrete adapter and its data-processing terms are reviewed.
const MALWARE_SCANNER_ADAPTER_AVAILABLE = false;

function readTrimmed(name: string, maxLength: number): string | null {
  const value = process.env[name]?.trim();
  return value && value.length <= maxLength ? value : null;
}

function readHeaderValue(name: string, maxLength: number): string | null {
  const value = readTrimmed(name, maxLength);
  return value && !/[\u0000-\u001f\u007f]/.test(value) ? value : null;
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
  const malwareScanUrl = readHttpsUrl("APPLICATIONS_MALWARE_SCAN_URL", true);
  const malwareScanToken = readHeaderValue("APPLICATIONS_MALWARE_SCAN_TOKEN", 2_048);
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
    !malwareScanUrl ||
    !malwareScanToken ||
    !MALWARE_SCANNER_ADAPTER_AVAILABLE ||
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

  return {
    allowedOrigin: allowedOriginUrl.origin,
    consentVersion,
    controller,
    ipHashSecret,
    malwareScanToken,
    malwareScanUrl: malwareScanUrl.toString(),
    rateLimitMax,
    rateLimitWindowMinutes,
    retentionDays,
    site: allowedOriginUrl.hostname,
    storageBucket: "cvs",
  };
}

export function areApplicationsAvailable(): boolean {
  return getApplicationsConfig() !== null;
}
