"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useHaptic } from "@/hooks/use-haptic";

interface HeaderDropdownItem {
  label: string;
  href: string;
}

interface HeaderDropdownMenuProps {
  label: string;
  items: HeaderDropdownItem[];
  className?: string;
}

export function HeaderDropdownMenu({
  label,
  items,
  className,
}: HeaderDropdownMenuProps) {
  const { trigger } = useHaptic();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const listItemIdPrefix = useMemo(() => `${menuId}-item`, [menuId]);

  useEffect(() => {
    const onOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", onOutsideClick);
    return () => document.removeEventListener("mousedown", onOutsideClick);
  }, []);

  const closeMenu = () => setIsOpen(false);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-sm px-2 sm:px-4 btn-interactive"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setIsOpen(false);
          }
        }}
      >
        <span>{label}</span>
        <ChevronDown
          className={cn(
            "ml-1 h-4 w-4 transition-transform duration-200 ease-out",
            isOpen ? "rotate-180" : "rotate-0"
          )}
        />
      </Button>

      <ul
        id={menuId}
        role="menu"
        aria-label={label}
        className={cn(
          "search-dropdown absolute right-0 top-[calc(100%+8px)] z-50 min-w-56 overflow-hidden rounded-xl border bg-white py-1 shadow-lg",
          isOpen
            ? "search-dropdown-open"
            : "search-dropdown-closed pointer-events-none"
        )}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            closeMenu();
          }
        }}
      >
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} role="none">
            <Link
              id={`${listItemIdPrefix}-${index}`}
              href={item.href}
              role="menuitem"
              className="search-dropdown-item block px-4 py-2.5 text-sm text-slate-700 outline-none focus:bg-primary/10 focus:text-slate-900"
              onClick={() => { trigger("selection"); closeMenu(); }}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
