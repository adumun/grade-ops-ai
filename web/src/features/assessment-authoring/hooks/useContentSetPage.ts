"use client";

import { useMemo } from "react";
import { useContentSetData } from "./useContentSetData";
import { useContentSetDraft } from "./useContentSetDraft";
import type { AssessmentAccess } from "../domain/types";

export function useContentSetPage(access: AssessmentAccess = "editable", simulateSaveError = false) {
  const data = useContentSetData();
  const initial = data.state.status === "ready" ? data.state.contentSet : undefined;
  const draft = useContentSetDraft(initial, data.fixtures, simulateSaveError);
  return useMemo(() => ({ dataState: data.state, draft, access, retryLoad: data.retry, resetDemoData: data.reset }), [access, data.reset, data.retry, data.state, draft]);
}
