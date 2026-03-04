"use client";

import { HapticContext, useHapticEngine } from "@/hooks/use-haptic";

export function HapticProvider({ children }: { children: React.ReactNode }) {
  const engine = useHapticEngine();

  return (
    <HapticContext value={engine}>
      {children}
    </HapticContext>
  );
}
