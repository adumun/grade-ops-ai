"use client";

import { useEffect, useState } from "react";
import { localRubricDataSource } from "../data/localRubricDataSource";
import type { RubricDataState } from "../domain/types";

const LOAD_ERROR = "No pudimos cargar la rúbrica local. Intenta nuevamente.";

export function useRubricData(simulateError = false) {
  const [state, setState] = useState<RubricDataState>({ status: "loading" });
  const [retryCount, setRetryCount] = useState(0);
  useEffect(() => {
    let active = true;
    async function load() {
      if (simulateError && retryCount === 0) { if (active) setState({ status: "error", message: LOAD_ERROR }); return; }
      try {
        const data = await localRubricDataSource.getRubric();
        if (active) setState({ status: "ready", ...data });
      } catch { if (active) setState({ status: "error", message: LOAD_ERROR }); }
    }
    void load();
    return () => { active = false; };
  }, [retryCount, simulateError]);
  return { state, retry: () => setRetryCount((count) => count + 1), reset: localRubricDataSource.reset };
}
