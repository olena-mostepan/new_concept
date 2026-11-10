"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from "react";

type Ctx = {
  askAssistant: () => void;
  registerAskAssistant: (fn: (() => void) | null) => void;
};

const OpsDetailBarCtx = createContext<Ctx | null>(null);

export function OpsDetailBarProvider({ children }: { children: ReactNode }) {
  const fnRef = useRef<(() => void) | null>(null);
  const registerAskAssistant = useCallback((next: (() => void) | null) => {
    fnRef.current = next;
  }, []);
  const askAssistant = useCallback(() => {
    fnRef.current?.();
  }, []);
  const value = useMemo(
    () => ({ askAssistant, registerAskAssistant }),
    [askAssistant, registerAskAssistant],
  );
  return (
    <OpsDetailBarCtx.Provider value={value}>{children}</OpsDetailBarCtx.Provider>
  );
}

export function useOpsDetailBar() {
  return useContext(OpsDetailBarCtx);
}
