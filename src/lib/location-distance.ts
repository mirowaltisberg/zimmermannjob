import { SWISS_POSTAL_CODES } from "@/lib/swiss-postal-codes";

export interface Coordinate {
  lat: number;
  lon: number;
}

const SWISS_PLZ_PATTERN = /\b(\d{4})\b/;

const CITY_COORDINATES: Record<string, Coordinate> = {
  zurich: { lat: 47.3769, lon: 8.5417 },
  bern: { lat: 46.9481, lon: 7.4474 },
  basel: { lat: 47.5596, lon: 7.5886 },
  luzern: { lat: 47.0502, lon: 8.3093 },
  "st gallen": { lat: 47.4245, lon: 9.3767 },
  "sankt gallen": { lat: 47.4245, lon: 9.3767 },
  winterthur: { lat: 47.499, lon: 8.7241 },
  aarau: { lat: 47.3925, lon: 8.0442 },
  biel: { lat: 47.1367, lon: 7.2468 },
  thun: { lat: 46.757, lon: 7.628 },
  chur: { lat: 46.8508, lon: 9.5329 },
  schaffhausen: { lat: 47.6973, lon: 8.6349 },
  solothurn: { lat: 47.2088, lon: 7.5374 },
  zug: { lat: 47.1662, lon: 8.5155 },
  fribourg: { lat: 46.8065, lon: 7.1619 },
  lausanne: { lat: 46.5197, lon: 6.6323 },
  lugano: { lat: 46.0037, lon: 8.9511 },
  sion: { lat: 46.2331, lon: 7.3606 },
  neuchatel: { lat: 46.9896, lon: 6.9293 },
  geneve: { lat: 46.2044, lon: 6.1432 },
  genf: { lat: 46.2044, lon: 6.1432 },
  nyon: { lat: 46.3832, lon: 6.2396 },
  uster: { lat: 47.3471, lon: 8.7181 },
  dietikon: { lat: 47.4017, lon: 8.401 },
  kloten: { lat: 47.4515, lon: 8.5849 },
  baden: { lat: 47.4738, lon: 8.3059 },
  olten: { lat: 47.3492, lon: 7.9039 },
  frauenfeld: { lat: 47.5578, lon: 8.8989 },
  yverdon: { lat: 46.7785, lon: 6.6412 },
  bulle: { lat: 46.6177, lon: 7.0564 },
  bellinzona: { lat: 46.193, lon: 9.0222 },
  locarno: { lat: 46.1696, lon: 8.7995 },
  wil: { lat: 47.4625, lon: 9.0457 },
  rapperswil: { lat: 47.2256, lon: 8.8219 },
  wohlen: { lat: 47.3527, lon: 8.2794 },
  davos: { lat: 46.802, lon: 9.8355 },
  vevey: { lat: 46.463, lon: 6.8439 },
  montreux: { lat: 46.433, lon: 6.9114 },
  sierre: { lat: 46.2919, lon: 7.5356 },
  martigny: { lat: 46.1026, lon: 7.0732 },
};

interface RegionEntry {
  coordinate: Coordinate;
  defaultRadiusKm: number;
}

const REGION_COORDINATES: Record<string, RegionEntry> = {
  "grossraum zurich": { coordinate: { lat: 47.38, lon: 8.55 }, defaultRadiusKm: 50 },
  "grossraum zuerich": { coordinate: { lat: 47.38, lon: 8.55 }, defaultRadiusKm: 50 },
  zentralschweiz: { coordinate: { lat: 46.97, lon: 8.47 }, defaultRadiusKm: 50 },
  nordwestschweiz: { coordinate: { lat: 47.43, lon: 7.74 }, defaultRadiusKm: 50 },
  ostschweiz: { coordinate: { lat: 47.28, lon: 9.17 }, defaultRadiusKm: 80 },
  mittelland: { coordinate: { lat: 46.94, lon: 7.41 }, defaultRadiusKm: 50 },
  "westschweiz romandie": { coordinate: { lat: 46.79, lon: 6.76 }, defaultRadiusKm: 80 },
  westschweiz: { coordinate: { lat: 46.79, lon: 6.76 }, defaultRadiusKm: 80 },
  romandie: { coordinate: { lat: 46.79, lon: 6.76 }, defaultRadiusKm: 80 },
  tessin: { coordinate: { lat: 46.3, lon: 8.9 }, defaultRadiusKm: 50 },
  wallis: { coordinate: { lat: 46.23, lon: 7.45 }, defaultRadiusKm: 50 },
};

const CANTON_CENTROIDS: Record<string, Coordinate> = {
  zh: { lat: 47.366, lon: 8.55 },
  zürich: { lat: 47.366, lon: 8.55 },
  be: { lat: 46.8, lon: 7.6 },
  bern: { lat: 46.8, lon: 7.6 },
  lu: { lat: 47.05, lon: 8.25 },
  luzern: { lat: 47.05, lon: 8.25 },
  ur: { lat: 46.78, lon: 8.62 },
  uri: { lat: 46.78, lon: 8.62 },
  sz: { lat: 47.05, lon: 8.75 },
  schwyz: { lat: 47.05, lon: 8.75 },
  ow: { lat: 46.88, lon: 8.25 },
  obwalden: { lat: 46.88, lon: 8.25 },
  nw: { lat: 46.93, lon: 8.4 },
  nidwalden: { lat: 46.93, lon: 8.4 },
  gl: { lat: 47.04, lon: 9.07 },
  glarus: { lat: 47.04, lon: 9.07 },
  zg: { lat: 47.15, lon: 8.52 },
  zug: { lat: 47.15, lon: 8.52 },
  fr: { lat: 46.73, lon: 7.08 },
  freiburg: { lat: 46.73, lon: 7.08 },
  fribourg: { lat: 46.73, lon: 7.08 },
  so: { lat: 47.3, lon: 7.55 },
  solothurn: { lat: 47.3, lon: 7.55 },
  bs: { lat: 47.56, lon: 7.59 },
  "basel stadt": { lat: 47.56, lon: 7.59 },
  bl: { lat: 47.45, lon: 7.75 },
  "basel landschaft": { lat: 47.45, lon: 7.75 },
  sh: { lat: 47.7, lon: 8.63 },
  schaffhausen: { lat: 47.7, lon: 8.63 },
  ar: { lat: 47.38, lon: 9.28 },
  "appenzell ausserrhoden": { lat: 47.38, lon: 9.28 },
  ai: { lat: 47.32, lon: 9.41 },
  "appenzell innerrhoden": { lat: 47.32, lon: 9.41 },
  sg: { lat: 47.3, lon: 9.3 },
  "st gallen": { lat: 47.3, lon: 9.3 },
  gr: { lat: 46.66, lon: 9.58 },
  graubünden: { lat: 46.66, lon: 9.58 },
  graubuenden: { lat: 46.66, lon: 9.58 },
  ag: { lat: 47.39, lon: 8.05 },
  aargau: { lat: 47.39, lon: 8.05 },
  tg: { lat: 47.55, lon: 8.9 },
  thurgau: { lat: 47.55, lon: 8.9 },
  ti: { lat: 46.3, lon: 8.9 },
  tessin: { lat: 46.3, lon: 8.9 },
  vd: { lat: 46.62, lon: 6.55 },
  waadt: { lat: 46.62, lon: 6.55 },
  vs: { lat: 46.23, lon: 7.45 },
  wallis: { lat: 46.23, lon: 7.45 },
  ne: { lat: 47.0, lon: 6.87 },
  neuenburg: { lat: 47.0, lon: 6.87 },
  ge: { lat: 46.22, lon: 6.15 },
  genf: { lat: 46.22, lon: 6.15 },
  ju: { lat: 47.37, lon: 7.16 },
  jura: { lat: 47.37, lon: 7.16 },
};

function normalizeToken(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[()]/g, " ")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .toLowerCase();
}

function firstMunicipality(value: string): string {
  return value.split(",")[0]?.trim() ?? value.trim();
}

function extractCantonCandidate(value: string): string | null {
  const parts = value.split(",").map((part) => part.trim()).filter(Boolean);
  if (parts.length < 2) {
    return null;
  }

  const lastPart = normalizeToken(parts[parts.length - 1] ?? "");
  if ((lastPart === "ch" || lastPart === "schweiz" || lastPart === "switzerland") && parts.length >= 2) {
    return parts[parts.length - 2] ?? null;
  }

  return parts[parts.length - 1] ?? null;
}

function resolveCityCoordinate(city: string): Coordinate | null {
  const normalizedCity = normalizeToken(city);
  if (!normalizedCity) {
    return null;
  }

  if (CITY_COORDINATES[normalizedCity]) {
    return CITY_COORDINATES[normalizedCity];
  }

  for (const [candidate, coordinate] of Object.entries(CITY_COORDINATES)) {
    if (normalizedCity.includes(candidate) || candidate.includes(normalizedCity)) {
      return coordinate;
    }
  }

  return null;
}

function resolveCantonCoordinate(canton: string): Coordinate | null {
  const normalizedCanton = normalizeToken(canton);
  if (!normalizedCanton) {
    return null;
  }

  return CANTON_CENTROIDS[normalizedCanton] ?? null;
}

function resolveRegionCoordinate(input: string): Coordinate | null {
  const normalized = normalizeToken(input);
  if (!normalized) {
    return null;
  }

  const region = REGION_COORDINATES[normalized];
  return region?.coordinate ?? null;
}

export function getRegionRadius(location: string): number | null {
  const normalized = normalizeToken(location);
  if (!normalized) {
    return null;
  }

  return REGION_COORDINATES[normalized]?.defaultRadiusKm ?? null;
}

function resolveViaPostalCode(location: string): Coordinate | null {
  const plzMatch = SWISS_PLZ_PATTERN.exec(location);
  if (!plzMatch) {
    return null;
  }

  const plz = plzMatch[1];
  const entry = SWISS_POSTAL_CODES[plz];
  if (!entry) {
    return null;
  }

  // Try municipality name as a city
  const municipalityCoordinate = resolveCityCoordinate(entry.municipality);
  if (municipalityCoordinate) {
    return municipalityCoordinate;
  }

  // Fall back to canton centroid
  const cantonCoordinate = resolveCantonCoordinate(entry.canton);
  if (cantonCoordinate) {
    return cantonCoordinate;
  }

  return null;
}

export function resolveLocationCoordinate(location: string): Coordinate | null {
  if (!location.trim()) {
    return null;
  }

  const regionCoordinate = resolveRegionCoordinate(location);
  if (regionCoordinate) {
    return regionCoordinate;
  }

  const cityCandidate = firstMunicipality(location.replace(/\b\d{4}\b/g, " "));
  const cityCoordinate = resolveCityCoordinate(cityCandidate);
  if (cityCoordinate) {
    return cityCoordinate;
  }

  // Try resolving via Swiss postal code (PLZ → municipality → canton centroid)
  const plzCoordinate = resolveViaPostalCode(location);
  if (plzCoordinate) {
    return plzCoordinate;
  }

  const cantonCandidate = extractCantonCandidate(location);
  if (cantonCandidate) {
    const cantonCoordinate = resolveCantonCoordinate(cantonCandidate);
    if (cantonCoordinate) {
      return cantonCoordinate;
    }
  }

  return null;
}

/** Resolve a PLZ-based location to its canton abbreviation for text matching fallback */
export function resolveLocationCanton(location: string): string | null {
  const plzMatch = SWISS_PLZ_PATTERN.exec(location);
  if (plzMatch) {
    const entry = SWISS_POSTAL_CODES[plzMatch[1]];
    if (entry) {
      return entry.canton;
    }
  }
  return null;
}

export function calculateDistanceKm(origin: Coordinate, target: Coordinate): number {
  const rad = Math.PI / 180;
  const dLat = (target.lat - origin.lat) * rad;
  const dLon = (target.lon - origin.lon) * rad;
  const lat1 = origin.lat * rad;
  const lat2 = target.lat * rad;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return 6371 * c;
}
