"use client";

import { useCallback, useEffect, useState } from "react";
import { useDemoState } from "@/components/shell/ShellContext";
import { localObjectiveDataSource } from "../data/localObjectiveDataSource";
import type { ObjectiveSetDataState } from "../domain/types";

const LOAD_ERROR = "No pudimos cargar los objetivos locales.";

export function useObjectiveData() {
  const { demoState } = useDemoState();
  const [state, setState] = useState<ObjectiveSetDataState>({ status: "loading" });
  const [retryCount, setRetryCount] = useState(0);
  const load = useCallback(async () => {
    setState({ status: "loading" });
    if (demoState === "loading") return;
    if (demoState === "error" && retryCount === 0) { setState({ status: "error", message: LOAD_ERROR }); return; }
    try {
      const objectiveSet = await localObjectiveDataSource.getObjectiveSet();
      setState({ status: "ready", objectiveSet: demoState === "empty" ? { ...objectiveSet, objectives: [] } : objectiveSet });
    } catch { setState({ status: "error", message: LOAD_ERROR }); }
  }, [demoState, retryCount]);
  useEffect(() => { void load(); }, [load]);
  return { state, retry: () => setRetryCount((count) => count + 1), reset: localObjectiveDataSource.reset };
}
