"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type DemoState = "ready" | "loading" | "empty" | "error" | "readonly" | "permission";

export const DEMO_STATE_OPTIONS: Array<{ value: DemoState; label: string }> = [
  { value: "ready", label: "Datos demo" },
  { value: "loading", label: "Carga" },
  { value: "empty", label: "Vacío global" },
  { value: "error", label: "Error de carga" },
  { value: "readonly", label: "Solo lectura" },
  { value: "permission", label: "Permisos insuficientes" },
];

export interface ShellConfig {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

interface ShellContextValue {
  config: ShellConfig;
  setConfig: (c: ShellConfig) => void;
  demoState: DemoState;
  setDemoState: (state: DemoState) => void;
}

const DEFAULT: ShellConfig = { title: "GradeOps AI" };
const DEFAULT_DEMO_STATE: DemoState = "ready";

const ShellContext = createContext<ShellContextValue>({
  config: DEFAULT,
  setConfig: () => {},
  demoState: DEFAULT_DEMO_STATE,
  setDemoState: () => {},
});

export function ShellProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<ShellConfig>(DEFAULT);
  const [demoState, setDemoState] = useState<DemoState>(DEFAULT_DEMO_STATE);
  return (
    <ShellContext.Provider value={{ config, setConfig, demoState, setDemoState }}>
      {children}
    </ShellContext.Provider>
  );
}

export function useShell(): ShellContextValue {
  return useContext(ShellContext);
}

export function useDemoState(): Pick<ShellContextValue, "demoState" | "setDemoState"> {
  const { demoState, setDemoState } = useContext(ShellContext);
  return { demoState, setDemoState };
}

export function useShellConfig(config: ShellConfig): void {
  const { setConfig } = useContext(ShellContext);
  useEffect(() => {
    setConfig(config);
    // Depend only on title: subtitle/actions are stable within a page render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.title]);
}
