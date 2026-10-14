import { isObjectiveProposal } from "./objectiveRules";
import type { Material, Objective, ObjectiveCoverage } from "./types";

export function calculateObjectiveCoverage(objectives: Objective[], materials: Material[]): ObjectiveCoverage {
  const assessable = objectives.filter((objective) => !isObjectiveProposal(objective));
  const withoutEvidence = assessable.filter((objective) => !objective.observableEvidence.trim()).length;
  const withoutMaterials = assessable.filter((objective) => objective.materialIds.length === 0).length;
  const coveredMaterialIds = [...new Set(assessable.flatMap((objective) => objective.materialIds))].filter((id) => materials.some((material) => material.id === id));
  const contentCoveragePercent = materials.length === 0 ? 0 : Math.round((coveredMaterialIds.length / materials.length) * 100);
  const warnings: string[] = [];
  if (assessable.length === 0) warnings.push("Aún no hay objetivos definitivos para esta evaluación.");
  if (withoutEvidence > 0) warnings.push(`${withoutEvidence} objetivo${withoutEvidence === 1 ? "" : "s"} sin evidencia observable.`);
  if (withoutMaterials > 0) warnings.push(`${withoutMaterials} objetivo${withoutMaterials === 1 ? "" : "s"} sin material asociado.`);
  if (materials.length === 0) warnings.push("El ContentSet no tiene materiales disponibles para vincular.");
  return { total: assessable.length, ready: assessable.filter((objective) => objective.status === "ready").length, withoutEvidence, withoutMaterials, coveredMaterialIds, contentCoveragePercent, warnings };
}
