import { cn } from "@/lib/utils";

interface SiteBrandProps {
  className?: string;
  inverse?: boolean;
}

/** A compact timber-frame lockup drawn in SVG; no external brand asset. */
export function SiteBrand({ className, inverse = false }: SiteBrandProps) {
  return (
    <span
      className={cn("site-brand", inverse && "site-brand--inverse", className)}
      role="img"
      aria-label="zimmermannjob.ch"
    >
      <svg
        className="site-brand__mark"
        viewBox="0 0 42 42"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M6 36V7h30v29M6 7l30 29M36 7L6 36" />
        <path d="M12 36V19h18v17M12 25h18" />
      </svg>
      <span className="site-brand__type">
        <strong>zimmermann</strong>
        <span>job.ch</span>
      </span>
    </span>
  );
}
