"use client";

import { useMemo } from "react";
import { useContentSetData } from "./useContentSetData";
import { useContentSetDraft } from "./useContentSetDraft";
import type { AssessmentAccess } from "../domain/types";

export function useContentSetPage(access: AssessmentAccess = "editable", simulateSaveError = false) {
  const data = useContentSetData();
  const initial = data.state.status === "ready" ? data.state.contentSet : undefined;
  const reusableContentSets = data.state.status === "ready" ? data.state.reusableContentSets : [];
  const associatedContentSetIds = data.state.status === "ready" ? data.state.associatedContentSetIds : [];
  const draft = useContentSetDraft(initial, data.fixtures, reusableContentSets, associatedContentSetIds, simulateSaveError);
  return useMemo(() => ({ dataState: data.state, draft, access, retryLoad: data.retry, resetDemoData: data.reset }), [access, data.reset, data.retry, data.state, draft]);
}
