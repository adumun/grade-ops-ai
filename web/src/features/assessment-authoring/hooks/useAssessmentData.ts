"use client";

import { useCallback, useEffect, useState } from "react";
import { useDemoState } from "@/components/shell/ShellContext";
import { localAssessmentDataSource } from "../data/localAssessmentDataSource";
import type { AssessmentDataState } from "../domain/types";

const LOAD_ERROR = "No pudimos cargar tus evaluaciones locales.";

export function useAssessmentData() {
  const { demoState } = useDemoState();
  const [state, setState] = useState<AssessmentDataState>({ status: "loading" });
  const [retryCount, setRetryCount] = useState(0);

  const load = useCallback(async () => {
    setState({ status: "loading" });
    if (demoState === "error" && retryCount === 0) {
      setState({ status: "error", message: LOAD_ERROR });
      return;
    }
    try {
      setState({ status: "ready", drafts: await localAssessmentDataSource.listDrafts() });
    } catch {
      setState({ status: "error", message: LOAD_ERROR });
    }
  }, [demoState, retryCount]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    state,
    retry: () => setRetryCount((count) => count + 1),
    reset: localAssessmentDataSource.reset,
  };
}
