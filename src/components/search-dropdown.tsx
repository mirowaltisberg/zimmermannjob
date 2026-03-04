"use client";

import { useState, useRef, useEffect, useCallback, useId } from "react";
import { cn } from "@/lib/utils";
import { useHaptic } from "@/hooks/use-haptic";

interface SearchDropdownProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder: string;
  icon: React.ReactNode;
  maxLength?: number;
  className?: string;
}

export function SearchDropdown({
  value,
  onChange,
  suggestions,
  placeholder,
  icon,
  maxLength = 80,
  className,
}: SearchDropdownProps) {
  const { trigger } = useHaptic();
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listboxId = useId();

  const filtered = value.trim()
    ? suggestions.filter((s) =>
        s.toLowerCase().includes(value.toLowerCase())
      )
    : suggestions;

  const showDropdown = isOpen && filtered.length > 0;

  const select = useCallback(
    (item: string) => {
      trigger("selection");
      onChange(item);
      setIsOpen(false);
      setHighlightedIndex(-1);
      inputRef.current?.blur();
    },
    [onChange, trigger]
  );

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const el = listRef.current.children[highlightedIndex] as HTMLElement;
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) {
      if (e.key === "ArrowDown") {
        setIsOpen(true);
        setHighlightedIndex(0);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filtered.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filtered.length - 1
        );
        break;
      case "Enter":
        if (highlightedIndex >= 0 && filtered[highlightedIndex]) {
          e.preventDefault();
          select(filtered[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  // Highlight matching text
  const renderHighlight = (text: string) => {
    if (!value.trim()) return text;
    const idx = text.toLowerCase().indexOf(value.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <span className="font-bold text-slate-900">{text.slice(idx, idx + value.length)}</span>
        {text.slice(idx + value.length)}
      </>
    );
  };

  return (
    <div ref={containerRef} className={cn("relative flex-1", className)}>
      <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
        {icon}
      </div>
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-expanded={showDropdown}
        aria-autocomplete="list"
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-activedescendant={
          highlightedIndex >= 0
            ? `${listboxId}-suggestion-${highlightedIndex}`
            : undefined
        }
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        className="flex h-12 w-full rounded-md bg-transparent pl-10 pr-3 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none"
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
          setHighlightedIndex(-1);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        autoComplete="off"
      />

      {/* Dropdown */}
      <ul
        id={listboxId}
        ref={listRef}
        role="listbox"
        className={cn(
          "search-dropdown absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-[min(55vh,16rem)] sm:max-h-56 overflow-y-auto overscroll-contain rounded-xl border bg-white shadow-lg",
          showDropdown ? "search-dropdown-open" : "search-dropdown-closed pointer-events-none"
        )}
      >
        {filtered.map((item, i) => (
          <li
            key={item}
            id={`${listboxId}-suggestion-${i}`}
            role="option"
            aria-selected={i === highlightedIndex}
            className={cn(
              "search-dropdown-item cursor-pointer select-none px-4 py-3 sm:py-2.5 text-[15px] sm:text-sm leading-tight text-slate-600 transition-colors duration-100",
              i === highlightedIndex && "bg-primary/8 text-slate-900",
              i === 0 && "rounded-t-xl",
              i === filtered.length - 1 && "rounded-b-xl"
            )}
            onMouseEnter={() => setHighlightedIndex(i)}
            onMouseDown={(e) => {
              e.preventDefault();
              select(item);
            }}
          >
            {renderHighlight(item)}
          </li>
        ))}
      </ul>
    </div>
  );
}
