"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type Ctx = {
  /** A page has registered an assistant (Ops package and asset pages with the checklist). */
  hasAssistant: boolean;
  askAssistant: () => void;
  registerAskAssistant: (fn: (() => void) | null) => void;
};

const OpsDetailBarCtx = createContext<Ctx | null>(null);

export function OpsDetailBarProvider({ children }: { children: ReactNode }) {
  const fnRef = useRef<(() => void) | null>(null);
  const [hasAssistant, setHasAssistant] = useState(false);
  const registerAskAssistant = useCallback((next: (() => void) | null) => {
    fnRef.current = next;
    setHasAssistant(Boolean(next));
  }, []);
  const askAssistant = useCallback(() => {
    fnRef.current?.();
  }, []);
  const value = useMemo(
    () => ({ hasAssistant, askAssistant, registerAskAssistant }),
    [hasAssistant, askAssistant, registerAskAssistant],
  );
  return (
    <OpsDetailBarCtx.Provider value={value}>{children}</OpsDetailBarCtx.Provider>
  );
}

export function useOpsDetailBar() {
  return useContext(OpsDetailBarCtx);
}
