import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { EditorialContent } from "@/data/editorial/zimmermannjob";
import { EDITORIAL_BYLINE } from "@/data/editorial/zimmermannjob";

interface EditorialIntroProps {
  /** Display label for the role, e.g. "Zimmermann EFZ" */
  role: string;
  /** Display label for the canton, e.g. "Zürich" */
  canton: string;
  /** Editorial content for this role × canton combo */
  content: EditorialContent;
}

const PUBLISHED_AT_LABEL = new Date(EDITORIAL_BYLINE.publishedAt).toLocaleDateString(
  "de-CH",
  { day: "2-digit", month: "long", year: "numeric" }
);

/**
 * Long-form editorial section rendered below the job tiles on category pages.
 * Renders only when an editorial entry exists for the role × canton key.
 * Lifts E-E-A-T signal beyond template boilerplate (~320 word minimum).
 */
export function EditorialIntro({ role, canton, content }: EditorialIntroProps) {
  return (
    <section
      className="mt-12 space-y-8 border-t border-slate-200 pt-10"
      aria-label="Redaktionelle Einführung"
    >
      <p className="text-xs text-slate-500 border-l-2 border-primary/40 pl-3">
        Geschrieben von{" "}
        <Link
          href={EDITORIAL_BYLINE.href}
          className="font-medium text-slate-700 hover:text-primary"
        >
          {EDITORIAL_BYLINE.name}
        </Link>{" "}
        · Stand {PUBLISHED_AT_LABEL}
      </p>

      <article>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">
          Was macht ein/e {role} in {canton}?
        </h2>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          {content.whatDoes}
        </p>
      </article>

      <article>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">
          Lohn &amp; Aufstiegschancen
        </h2>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          {content.salary}
        </p>
        <Button asChild variant="outline" size="sm" className="mt-3">
          <Link href="/#loehne">Lohnübersicht ansehen</Link>
        </Button>
      </article>

      <article>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">
          Welche Betriebe stellen ein?
        </h2>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          {content.employers}
        </p>
      </article>

      <article>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">
          Bewerbungs-Tipps
        </h2>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          {content.applicationTips}
        </p>
      </article>
    </section>
  );
}
