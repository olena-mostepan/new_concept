"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type Ctx = {
  askAssistant: () => void;
  registerAskAssistant: (fn: (() => void) | null) => void;
};

const OpsDetailBarCtx = createContext<Ctx | null>(null);

export function OpsDetailBarProvider({ children }: { children: ReactNode }) {
  const [fn, setFn] = useState<(() => void) | null>(null);
  const registerAskAssistant = useCallback((next: (() => void) | null) => {
    setFn(() => next);
  }, []);
  const askAssistant = useCallback(() => {
    fn?.();
  }, [fn]);
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
