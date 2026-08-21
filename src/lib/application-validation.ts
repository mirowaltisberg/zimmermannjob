export const MAX_APPLICATION_PDF_BYTES = 5 * 1024 * 1024;
export const MAX_APPLICATION_REQUEST_BYTES = MAX_APPLICATION_PDF_BYTES + 64 * 1024;
export const MIN_APPLICATION_FORM_AGE_MS = 3_000;
export const MAX_APPLICATION_FORM_AGE_MS = 2 * 60 * 60 * 1_000;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_CHARACTERS_PATTERN = /^\+?[0-9 ()/.-]+$/;
const SAFE_PDF_FILENAME_PATTERN = /^[\p{L}\p{N}][\p{L}\p{N} ._()-]*\.pdf$/iu;
const DISALLOWED_PDF_FEATURES =
  /\/(?:AA|AcroForm|EmbeddedFile|Encrypt|ImportData|JavaScript|JS|Launch|Movie|OpenAction|RichMedia|Screen|Sound|SubmitForm|XFA)(?![\p{L}\p{N}])/iu;

export function isValidEmail(value: string): boolean {
  return value.length <= 254 && EMAIL_PATTERN.test(value);
}

export function isValidPhone(value: string): boolean {
  if (value.length > 40 || !PHONE_CHARACTERS_PATTERN.test(value)) {
    return false;
  }

  const digits = value.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
}

export function isValidPlainText(value: string, maxLength: number): boolean {
  return value.length > 0 && value.length <= maxLength && !/[\u0000-\u001f\u007f]/.test(value);
}

export function isValidPdfFilename(value: string): boolean {
  return (
    value.length > 4 &&
    value.length <= 120 &&
    !value.includes("/") &&
    !value.includes("\\") &&
    SAFE_PDF_FILENAME_PATTERN.test(value)
  );
}

export function hasPdfMagic(bytes: Uint8Array): boolean {
  if (bytes.byteLength < 10) {
    return false;
  }

  const header = new TextDecoder("latin1").decode(bytes.slice(0, 5));
  if (header !== "%PDF-") {
    return false;
  }

  const tail = new TextDecoder("latin1").decode(bytes.slice(Math.max(0, bytes.byteLength - 2_048)));
  return /%%EOF[\u0000-\u0020]*$/.test(tail);
}

function decodePdfNameEscapes(value: string): string {
  return value.replace(/#([0-9a-f]{2})/gi, (_match, hex: string) =>
    String.fromCharCode(Number.parseInt(hex, 16))
  );
}

/**
 * Reject active, embedded, encrypted, or form-capable PDF constructs before a
 * CV reaches private storage. This is intentionally conservative: applicants
 * can export the document as a plain PDF and retry.
 */
export function hasDisallowedPdfFeatures(bytes: Uint8Array): boolean {
  const source = new TextDecoder("latin1").decode(bytes);
  return DISALLOWED_PDF_FEATURES.test(decodePdfNameEscapes(source));
}

export function isAcceptableFormAge(startedAtValue: string, now = Date.now()): boolean {
  if (!/^\d{13}$/.test(startedAtValue)) {
    return false;
  }

  const age = now - Number(startedAtValue);
  return age >= MIN_APPLICATION_FORM_AGE_MS && age <= MAX_APPLICATION_FORM_AGE_MS;
}

export function readBoundedInteger(
  value: string | undefined,
  fallback: number,
  minimum: number,
  maximum: number
): number | null {
  if (value === undefined || value === "") {
    return fallback;
  }

  if (!/^\d+$/.test(value)) {
    return null;
  }

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= minimum && parsed <= maximum
    ? parsed
    : null;
}
