import { resolveLocationCoordinate } from "@/lib/location-distance";
import { SWISS_POSTAL_CODES } from "@/lib/swiss-postal-codes";
import type { DirectHireOpportunity, RemoteFilter } from "@/lib/job-types";

export const DIRECT_HIRE_FEED_TARGET = 12;

const DIRECT_HIRE_PROCESS =
  "Unser Team sucht fortlaufend einen passenden Arbeitgeber für dieses Berufsprofil. Die Anstellung erfolgt direkt bei diesem Arbeitgeber.";

const CONTROLLED_ROLES = [
  { key: "zimmermann-efz", role: "Zimmermann/Zimmerin EFZ", aliases: ["efz"] },
  { key: "elementbau", role: "Zimmermann/Zimmerin Elementbau", aliases: ["elementbau", "element"] },
  { key: "montage", role: "Zimmermann/Zimmerin Montage", aliases: ["montage"] },
  { key: "werkstatt", role: "Zimmermann/Zimmerin Werkstatt", aliases: ["werkstatt", "vorfertigung"] },
  { key: "abbund-cnc", role: "CNC-Maschinist/in Abbund", aliases: ["cnc", "abbund"] },
  { key: "sanierung", role: "Zimmermann/Zimmerin Sanierung", aliases: ["sanierung", "umbau"] },
  { key: "zimmermannpraktiker-eba", role: "Zimmermannpraktiker/in EBA", aliases: ["eba", "zimmermannpraktiker"] },
  { key: "vorarbeiter", role: "Holzbau-Vorarbeiter/in", aliases: ["vorarbeiter"] },
  { key: "polier", role: "Holzbau-Polier/in", aliases: ["polier"] },
  { key: "projektleitung", role: "Projektleiter/in Holzbau", aliases: ["projektleiter", "projektleitung"] },
  { key: "technik-hf", role: "Techniker/in HF Holztechnik", aliases: ["techniker", "holztechnik"] },
  { key: "bauleitung", role: "Bauleiter/in Holzbau", aliases: ["bauleiter", "bauleitung"] },
] as const;

const OPPORTUNITY_KEYS = new Set([
  "kind", "id", "role", "location", "engagement", "preferenceSummary", "process", "contactHref",
]);

export interface DirectHirePreferences {
  q?: string;
  loc?: string;
  type?: string;
  workload?: string;
  remote?: RemoteFilter;
}

interface BuildDirectHireInput {
  visibleRealRows: number;
  offset: number;
  preferences: DirectHirePreferences;
}

function normalizeToken(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("de-CH")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function safeLocationLabel(value: string | undefined): string {
  const candidate = (value ?? "").replace(/\s+/g, " ").trim();
  if (!candidate) return "Ganze Schweiz";
  const postalCode = candidate.match(/(?:^|\D)(\d{4})(?:\D|$)/)?.[1];
  if (postalCode) {
    const postalEntry = SWISS_POSTAL_CODES[postalCode];
    if (postalEntry) return `${postalCode} ${postalEntry.municipality}`;
  }
  if (
    candidate.length > 60 ||
    !/^[\p{L}\p{N} .,'’()\-/]+$/u.test(candidate) ||
    !resolveLocationCoordinate(candidate)
  ) return "Ganze Schweiz";
  return candidate;
}

function controlledType(value: string | undefined): string | null {
  const normalized = normalizeToken(value ?? "");
  if (!normalized || normalized === "all") return null;
  if (normalized.includes("fest")) return "Festanstellung bevorzugt";
  if (normalized.includes("tempor")) return "Temporäre Anstellung bevorzugt";
  if (normalized.includes("lehr")) return "Lehrstelle bevorzugt";
  if (normalized.includes("prakt")) return "Praktikum bevorzugt";
  return null;
}

function controlledWorkload(value: string | undefined): string | null {
  const compact = (value ?? "").replace(/\s+/g, "").replace("–", "-");
  const match = /^(\d{1,3})(?:-(\d{1,3}))?%$/.exec(compact);
  if (!match) return null;
  const from = Number(match[1]);
  const to = Number(match[2] ?? match[1]);
  if (from < 1 || to > 100 || from > to) return null;
  return from === to ? `${from}% Pensum bevorzugt` : `${from}–${to}% Pensum bevorzugt`;
}

function buildPreferenceSummary(location: string, preferences: DirectHirePreferences): string[] {
  const summary = [`Region: ${location}`];
  const type = controlledType(preferences.type);
  const workload = controlledWorkload(preferences.workload);
  if (type) summary.push(type);
  if (workload) summary.push(workload);
  if (preferences.remote === "true") summary.push("Remote-Arbeit bevorzugt");
  if (preferences.remote === "false") summary.push("Arbeit vor Ort bevorzugt");
  return summary;
}

function matchingRoleIndex(query: string | undefined): number {
  const normalizedQuery = normalizeToken(query ?? "");
  if (!normalizedQuery) return 0;
  let bestIndex = 0;
  let bestAliasLength = 0;
  CONTROLLED_ROLES.forEach((entry, index) => {
    entry.aliases.forEach((alias) => {
      const normalizedAlias = normalizeToken(alias);
      if (normalizedAlias.length > bestAliasLength && normalizedQuery.includes(normalizedAlias)) {
        bestIndex = index;
        bestAliasLength = normalizedAlias.length;
      }
    });
  });
  return bestIndex;
}

function stableHash(value: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function contactHref(roleKey: string, location: string): string {
  const params = new URLSearchParams({ anliegen: "direktanstellung", profil: roleKey, region: location });
  return `/kontakt?${params.toString()}`;
}

export function assertDirectHireOpportunity(value: DirectHireOpportunity): void {
  const keys = Object.keys(value);
  if (keys.some((key) => !OPPORTUNITY_KEYS.has(key)) || keys.length !== OPPORTUNITY_KEYS.size) {
    throw new Error("DirectHireOpportunity contains an unreviewed field");
  }
  if (value.kind !== "direct-hire-opportunity" || value.engagement !== "Direktanstellung") {
    throw new Error("DirectHireOpportunity has an invalid discriminator");
  }
  if (!value.id.startsWith("direct-hire-zimmermann-") || !value.role || !value.location) {
    throw new Error("DirectHireOpportunity has invalid controlled identity fields");
  }
  if (value.process !== DIRECT_HIRE_PROCESS || !Array.isArray(value.preferenceSummary)) {
    throw new Error("DirectHireOpportunity has invalid controlled copy");
  }
  if (!value.contactHref.startsWith("/kontakt?") || value.contactHref.includes("/jobs")) {
    throw new Error("DirectHireOpportunity has an unsafe contact route");
  }
}

export function buildDirectHireOpportunities({
  visibleRealRows,
  offset,
  preferences,
}: BuildDirectHireInput): DirectHireOpportunity[] {
  if (offset !== 0) return [];
  const realCount = Math.min(
    Math.max(Number.isFinite(visibleRealRows) ? Math.floor(visibleRealRows) : 0, 0),
    DIRECT_HIRE_FEED_TARGET,
  );
  const count = DIRECT_HIRE_FEED_TARGET - realCount;
  if (count === 0) return [];
  const location = safeLocationLabel(preferences.loc);
  const preferenceSummary = buildPreferenceSummary(location, preferences);
  const roleStart = matchingRoleIndex(preferences.q);
  const seed = `${location}|${preferenceSummary.join("|")}`;
  return Array.from({ length: count }, (_, index) => {
    const role = CONTROLLED_ROLES[(roleStart + index) % CONTROLLED_ROLES.length];
    const opportunity: DirectHireOpportunity = {
      kind: "direct-hire-opportunity",
      id: `direct-hire-zimmermann-${stableHash(`${seed}|${role.key}|${index}`)}`,
      role: role.role,
      location,
      engagement: "Direktanstellung",
      preferenceSummary: [...preferenceSummary],
      process: DIRECT_HIRE_PROCESS,
      contactHref: contactHref(role.key, location),
    };
    assertDirectHireOpportunity(opportunity);
    return opportunity;
  });
}
