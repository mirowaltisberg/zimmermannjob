"use client";

import { useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

interface StaggeredListProps {
  children: React.ReactNode[];
  className?: string;
  /** Delay between each child card animation, in ms */
  staggerMs?: number;
  /** Base delay before the first card starts, in ms */
  baseDelayMs?: number;
  /** Change this value to re-trigger the stagger animation (e.g. on new search results) */
  triggerKey?: string | number;
}

export function StaggeredList({
  children,
  className,
  staggerMs = 30,
  baseDelayMs = 0,
  triggerKey,
}: StaggeredListProps) {
  const ref = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const animateItems = useCallback(() => {
    const container = ref.current;
    if (!container) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const items = Array.from(
      container.querySelectorAll<HTMLElement>(".animate-card")
    );

    // Reset all items first
    items.forEach((item) => {
      item.classList.remove("is-visible");
      item.style.transitionDelay = "0ms";
    });

    if (prefersReduced) {
      items.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    // Use rAF instead of forced reflow for the reset to take effect
    requestAnimationFrame(() => {
      // Clean up previous observer
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              items.forEach((item, i) => {
                item.style.transitionDelay = `${baseDelayMs + i * staggerMs}ms`;
                item.classList.add("is-visible");
              });
              observer.unobserve(container);
            }
          });
        },
        { threshold: 0.02, rootMargin: "0px 0px -20px 0px" }
      );

      observerRef.current = observer;
      observer.observe(container);
    });
  }, [staggerMs, baseDelayMs]);

  // Re-trigger on children change or explicit triggerKey change
  useEffect(() => {
    animateItems();
    return () => observerRef.current?.disconnect();
  }, [animateItems, triggerKey, children.length]);

  return (
    <div ref={ref} className={cn("space-y-4", className)}>
      {children.map((child, i) => (
        <div key={i} className="animate-card">
          {child}
        </div>
      ))}
    </div>
  );
}
