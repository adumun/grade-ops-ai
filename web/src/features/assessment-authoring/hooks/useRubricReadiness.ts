"use client";

import { useMemo } from "react";
import { calculateRubricReadiness } from "../domain/rubricCoverage";
import type { Objective, RubricCriterion } from "../domain/types";

export function useRubricReadiness(criteria: RubricCriterion[], objectives: Objective[]) {
  return useMemo(() => calculateRubricReadiness(criteria, objectives), [criteria, objectives]);
}
