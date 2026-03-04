"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface AnimateOnScrollProps {
  children: React.ReactNode;
  className?: string;
  /** Extra delay in ms applied to the transition (for stagger effects) */
  delay?: number;
  /** Intersection threshold — 0..1 */
  threshold?: number;
}

/**
 * Wraps any content and fades it in (with a slight upward slide) once it
 * enters the viewport.  Uses IntersectionObserver so it works in server-
 * component trees — only the wrapper div itself is a client component.
 *
 * Animations are driven entirely by CSS classes defined in globals.css so
 * there is zero JS animation overhead after mount.
 */
export function AnimateOnScroll({
  children,
  className,
  delay = 0,
  threshold = 0.12,
}: AnimateOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect reduced-motion at the JS level too
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReduced) {
      el.classList.add("is-visible");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add("is-visible");
            observer.unobserve(el);
          }
        });
      },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div
      ref={ref}
      className={cn("animate-on-scroll", className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
