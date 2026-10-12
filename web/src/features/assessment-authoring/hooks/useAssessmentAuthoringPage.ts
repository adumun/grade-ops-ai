"use client";

import { useMemo } from "react";
import { useAssessmentData } from "./useAssessmentData";
import { useAssessmentDraft } from "./useAssessmentDraft";
import type { AssessmentAccess } from "../domain/types";

export function useAssessmentAuthoringPage(access: AssessmentAccess = "editable", simulateSaveError = false) {
  const data = useAssessmentData();
  const existingDraft = data.state.status === "ready" ? data.state.drafts[0] : undefined;
  const draft = useAssessmentDraft(existingDraft, simulateSaveError);
  const view = useMemo(() => ({
    dataState: data.state,
    draft,
    hasDraft: Boolean(existingDraft),
    access,
    resetDemoData: data.reset,
    retryLoad: data.retry,
  }), [access, data.reset, data.retry, data.state, draft, existingDraft]);
  return view;
}
