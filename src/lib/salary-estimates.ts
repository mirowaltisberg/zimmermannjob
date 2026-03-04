/**
 * Approximate annual CHF salary ranges for Swiss timber construction / carpentry roles.
 * Used when no salary data is available from the job source.
 */

export interface SalaryRange {
  min: number;
  max: number;
}

/**
 * Pattern → salary range mapping.
 * Checked top-to-bottom; first match wins, so put specific roles before generic ones.
 */
const ROLE_SALARY_MAP: { patterns: string[]; range: SalaryRange }[] = [
  // Leadership / senior roles
  {
    patterns: ["bauleiter"],
    range: { min: 90_000, max: 120_000 },
  },
  {
    patterns: ["projektleiter"],
    range: { min: 85_000, max: 110_000 },
  },
  // Planning / design
  {
    patterns: ["holzbauplaner", "planer holzbau", "holzbauingenieur"],
    range: { min: 80_000, max: 105_000 },
  },
  // Polier / Vorarbeiter
  {
    patterns: ["polier", "vorarbeiter"],
    range: { min: 78_000, max: 98_000 },
  },
  // Core trades
  {
    patterns: ["zimmermann", "zimmerfrau"],
    range: { min: 65_000, max: 80_000 },
  },
  {
    patterns: ["holzbauer"],
    range: { min: 65_000, max: 80_000 },
  },
  {
    patterns: ["dachdecker", "dachsanierung"],
    range: { min: 62_000, max: 78_000 },
  },
  {
    patterns: ["schreiner"],
    range: { min: 60_000, max: 78_000 },
  },
  {
    patterns: ["holzbau-monteur", "holzbaumonteur", "montagezimmermann"],
    range: { min: 62_000, max: 78_000 },
  },
  {
    patterns: ["fassadenbauer", "fassadenmonteur"],
    range: { min: 65_000, max: 82_000 },
  },
  {
    patterns: ["elementbau", "holzelementbau"],
    range: { min: 62_000, max: 78_000 },
  },
  {
    patterns: ["abbund", "abbundmeister"],
    range: { min: 68_000, max: 85_000 },
  },
  {
    patterns: ["treppenbauer"],
    range: { min: 65_000, max: 82_000 },
  },
  {
    patterns: ["innenausbau"],
    range: { min: 60_000, max: 78_000 },
  },
  {
    patterns: ["spengler"],
    range: { min: 65_000, max: 80_000 },
  },
  // Broad fallbacks (keep last)
  {
    patterns: ["holzbau", "zimmerei"],
    range: { min: 62_000, max: 80_000 },
  },
  {
    patterns: ["techniker"],
    range: { min: 72_000, max: 92_000 },
  },
  {
    patterns: ["monteur"],
    range: { min: 60_000, max: 78_000 },
  },
];

/**
 * Estimate an annual CHF salary range from a job title.
 * Returns `null` when no pattern matches.
 */
export function estimateSalary(title: string): SalaryRange | null {
  const lower = title.toLowerCase();

  for (const entry of ROLE_SALARY_MAP) {
    for (const pattern of entry.patterns) {
      if (lower.includes(pattern)) {
        return entry.range;
      }
    }
  }

  return null;
}

/**
 * Format a salary range as a Swiss-locale string, e.g. "75'000 – 95'000".
 */
export function formatSalaryRange(range: SalaryRange): string {
  const fmt = (n: number) =>
    n.toLocaleString("de-CH", { maximumFractionDigits: 0 });
  return `${fmt(range.min)} – ${fmt(range.max)}`;
}
