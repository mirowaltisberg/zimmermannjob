"use client";

import { createContext, useContext, useCallback, useRef, useEffect } from "react";
import type { WebHaptics } from "web-haptics";

export type HapticStyle =
  | "light"
  | "selection"
  | "success"
  | "error"
  | "nudge";

const PATTERNS: Record<HapticStyle, number | Array<{ duration: number; intensity?: number; delay?: number }>> = {
  light: 8,
  selection: [{ duration: 6, intensity: 0.4 }],
  success: [{ duration: 30, intensity: 0.6 }, { delay: 40, duration: 30, intensity: 0.8 }],
  error: [
    { duration: 30, intensity: 0.7 },
    { delay: 50, duration: 25, intensity: 0.6 },
    { delay: 50, duration: 30, intensity: 0.8 },
  ],
  nudge: [{ duration: 12, intensity: 0.5 }],
};

interface HapticContextValue {
  trigger: (style?: HapticStyle) => void;
}

export const HapticContext = createContext<HapticContextValue>({
  trigger: () => {},
});

export function useHapticEngine() {
  const instanceRef = useRef<WebHaptics | null>(null);
  const initPromiseRef = useRef<Promise<WebHaptics> | null>(null);

  const getInstance = useCallback(async (): Promise<WebHaptics | null> => {
    if (instanceRef.current) return instanceRef.current;

    if (!initPromiseRef.current) {
      initPromiseRef.current = import("web-haptics").then(({ WebHaptics: WH }) => {
        const wh = new WH();
        instanceRef.current = wh;
        return wh;
      });
    }

    return initPromiseRef.current;
  }, []);

  const trigger = useCallback(
    (style: HapticStyle = "light") => {
      void getInstance().then((wh) => wh?.trigger(PATTERNS[style]));
    },
    [getInstance],
  );

  useEffect(() => {
    return () => {
      instanceRef.current?.destroy();
      instanceRef.current = null;
      initPromiseRef.current = null;
    };
  }, []);

  return { trigger };
}

export function useHaptic() {
  return useContext(HapticContext);
}
