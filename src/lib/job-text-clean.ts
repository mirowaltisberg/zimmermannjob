const NOISE_LINE_PATTERNS = [
  /^#+\s*$/i,
  /^[-=*]{3,}$/i,
  /^(\+\s*){2,}$/i,
  /^\d+$/i,
  /^(jobbenachrichtigungen|teilen|drucken|datenschutz|mehr erfahren)$/i,
  /^(weitere stellen entdecken|zum anfang|route berechnen)$/i,
  /^(deine benefits|dein arbeitsort|arbeitsbeginn)$/i,
];

const SECTION_HEADING_PATTERNS = [
  /^deine? aufgaben$/i,
  /^deine? profil$/i,
  /^deine? vorteile$/i,
  /^deine? benefits$/i,
  /^deine? skills im gepäck$/i,
  /^das erwartet dich$/i,
  /^das bringst du mit$/i,
  /^unser angebot$/i,
  /^ihr profil$/i,
  /^ihre aufgaben$/i,
];

function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function stripInlineMarkdown(input: string): string {
  return input
    .replace(/!\[[^\]]*]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/^\s{0,3}#{1,6}\s+/g, "")
    .replace(/[*_`~]/g, "")
    .replace(/\\([\\\-_*[\]()#+.!])/g, "$1");
}

function sanitizeLine(line: string): string {
  return stripInlineMarkdown(line)
    .replace(/^\s*(?:[-*•►▸◦‣]|\d+[.)])\s+/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isNoiseLine(line: string): boolean {
  if (!line) {
    return true;
  }

  for (const pattern of NOISE_LINE_PATTERNS) {
    if (pattern.test(line)) {
      return true;
    }
  }

  return false;
}

function fixEncodedUmlauts(text: string): string {
  return text
    .replace(/\bfuer\b/gi, (m) => m[0] === "F" ? "Für" : "für")
    .replace(/\bueber\b/gi, (m) => m[0] === "U" ? "Über" : "über")
    .replace(/\bLoes/g, "Lös")
    .replace(/\bloes/g, "lös");
}

export function cleanJobText(input: string): string {
  if (!input) {
    return "";
  }

  const decoded = decodeHtmlEntities(input)
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n");

  const lines = decoded.split("\n");
  const cleanedLines: string[] = [];

  for (const rawLine of lines) {
    const line = sanitizeLine(rawLine);
    if (isNoiseLine(line)) {
      continue;
    }
    cleanedLines.push(line);
  }

  const joined = cleanedLines.join(" ").replace(/\s+/g, " ").trim();
  return fixEncodedUmlauts(joined);
}

function truncateAtWord(input: string, maxLength: number): string {
  if (input.length <= maxLength) {
    return input;
  }

  const sliced = input.slice(0, maxLength);
  const lastSpace = sliced.lastIndexOf(" ");

  if (lastSpace <= 40) {
    return `${sliced.trim()}...`;
  }

  return `${sliced.slice(0, lastSpace).trim()}...`;
}

export function cleanJobSummary(description: string, fallbackText: string, maxLength = 280): string {
  const cleanedDescription = cleanJobText(description);
  const candidate = cleanedDescription.length >= 50 ? cleanedDescription : cleanJobText(fallbackText);
  return truncateAtWord(candidate, maxLength);
}

function extractBulletCandidates(rawText: string): string[] {
  if (!rawText) {
    return [];
  }

  return rawText
    .split("\n")
    .filter((line) => /^\s*(?:[-*•►▸◦‣]|\d+[.)])\s+/.test(line))
    .map((line) => sanitizeLine(line))
    .filter((line) => line.length >= 18 && !isNoiseLine(line));
}

export function cleanJobList(items: string[], fallbackText = "", maxItems = 6): string[] {
  const cleaned = items
    .map((item) => cleanJobText(item))
    .filter(
      (item) =>
        item.length >= 18 &&
        !SECTION_HEADING_PATTERNS.some((pattern) => pattern.test(item)) &&
        !isNoiseLine(item)
    );

  const normalized = [...new Set(cleaned)];
  if (normalized.length > 0) {
    return normalized.slice(0, maxItems);
  }

  return [...new Set(extractBulletCandidates(fallbackText))].slice(0, maxItems);
}
