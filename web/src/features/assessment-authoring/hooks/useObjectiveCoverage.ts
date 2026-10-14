"use client";

import { useMemo } from "react";
import { calculateObjectiveCoverage } from "../domain/objectiveCoverage";
import type { Material, Objective } from "../domain/types";

export function useObjectiveCoverage(objectives: Objective[], materials: Material[]) {
  return useMemo(() => calculateObjectiveCoverage(objectives, materials), [materials, objectives]);
}
