import type { Objective, RubricCriterion, RubricReadiness } from "./types";
import { findDuplicateCriteria, validateCriterion, weightState } from "./rubricRules";

export function calculateRubricReadiness(criteria: RubricCriterion[], objectives: Objective[]): RubricReadiness {
  const weights = weightState(criteria);
  const activeObjectives = objectives.filter((objective) => objective.aiDecision !== "pending" && objective.aiDecision !== "rejected");
  const linked = new Set(criteria.flatMap((criterion) => criterion.objectiveIds));
  const objectivesWithoutCriterion = activeObjectives.filter((objective) => !linked.has(objective.id)).map((objective) => objective.title);
  const duplicateCriteria = findDuplicateCriteria(criteria);
  const blockers = criteria.flatMap((criterion) => validateCriterion(criterion).errors);
  if (criteria.length === 0) blockers.push("Agrega al menos un criterio para continuar.");
  if (weights.state !== "correct") blockers.push(weights.state === "exceeded" ? "Los pesos exceden 100%." : "La suma de pesos debe llegar a 100%.");
  const warnings = [
    ...criteria.flatMap((criterion) => validateCriterion(criterion).warnings),
    ...(objectivesWithoutCriterion.length ? [`${objectivesWithoutCriterion.length} objetivo(s) aún no tienen criterio.`] : []),
    ...(duplicateCriteria.length ? ["Hay criterios con nombres duplicados."] : []),
  ];
  return { isReady: blockers.length === 0 && warnings.length === 0, weightTotal: weights.total, weightState: weights.state, objectivesWithoutCriterion, duplicateCriteria, warnings, blockers };
}
