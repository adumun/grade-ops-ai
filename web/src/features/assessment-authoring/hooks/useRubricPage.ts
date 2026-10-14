"use client";

import { useObjectiveData } from "./useObjectiveData";
import { useRubricData } from "./useRubricData";
import { useRubricDraft } from "./useRubricDraft";
import { useRubricReadiness } from "./useRubricReadiness";
import type { AssessmentAccess } from "../domain/types";

export function useRubricPage(access: AssessmentAccess = "editable", simulateError = false, simulateSaveError = false) {
  const data = useRubricData(simulateError);
  const objectiveData = useObjectiveData();
  const initial = data.state.status === "ready" ? data.state.rubric : undefined;
  const draft = useRubricDraft(initial, access, simulateSaveError);
  const objectives = objectiveData.state.status === "ready" ? objectiveData.state.objectiveSet.objectives : [];
  const readiness = useRubricReadiness(draft.rubric.criteria, objectives);
  return { dataState: data.state, objectiveState: objectiveData.state, objectives, draft, readiness, retryLoad: data.retry };
}
