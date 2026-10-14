"use client";

import { useContentSetData } from "./useContentSetData";
import { useObjectiveCoverage } from "./useObjectiveCoverage";
import { useObjectiveData } from "./useObjectiveData";
import { useObjectiveSet } from "./useObjectiveSet";
import type { AssessmentAccess } from "../domain/types";

export function useObjectivePage(access: AssessmentAccess = "editable", simulateSaveError = false) {
  const objectiveData = useObjectiveData();
  const contentData = useContentSetData();
  const initial = objectiveData.state.status === "ready" ? objectiveData.state.objectiveSet : undefined;
  const objectiveSet = useObjectiveSet(initial, simulateSaveError);
  const materials = contentData.state.status === "ready" ? contentData.state.contentSet.materials : [];
  const coverage = useObjectiveCoverage(objectiveSet.objectives, materials);
  return { dataState: objectiveData.state, contentState: contentData.state, objectiveSet, materials, coverage, access, retryLoad: objectiveData.retry, resetDemoData: objectiveData.reset };
}
