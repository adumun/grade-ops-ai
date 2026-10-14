import type { AssessmentAccess, RubricCriterion, RubricCriterionValidation, RubricLevel } from "./types";

export const EMPTY_LEVEL: RubricLevel = { id: "level-local-1", label: "Logro esperado", descriptor: "", score: 0 };

export function isValidLevel(level: RubricLevel) {
  return Boolean(level.label.trim() && level.descriptor.trim() && Number.isFinite(level.score) && level.score >= 0);
}

export function validateCriterion(criterion: RubricCriterion): RubricCriterionValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!criterion.title.trim()) errors.push("Cada criterio necesita un nombre.");
  if (!Number.isFinite(criterion.weight) || criterion.weight < 0) errors.push("El peso debe ser un número no negativo.");
  if (criterion.levels.length === 0) errors.push("Agrega al menos un nivel de logro.");
  if (criterion.levels.some((level) => !level.descriptor.trim())) errors.push("Cada nivel requiere un descriptor.");
  if (criterion.levels.some((level) => !Number.isFinite(level.score) || level.score < 0)) errors.push("Los puntajes no pueden ser negativos.");
  if (criterion.objectiveIds.length === 0) warnings.push("Vincula este criterio con al menos un objetivo.");
  return { errors, warnings, isValid: errors.length === 0 };
}

export function weightState(criteria: RubricCriterion[]) {
  const total = criteria.reduce((sum, criterion) => sum + (Number.isFinite(criterion.weight) ? criterion.weight : 0), 0);
  return { total, state: total === 100 ? "correct" as const : total > 100 ? "exceeded" as const : "incomplete" as const };
}

export function findDuplicateCriteria(criteria: RubricCriterion[]) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  criteria.forEach(({ title }) => {
    const normalized = title.trim().toLocaleLowerCase();
    if (!normalized) return;
    if (seen.has(normalized)) duplicates.add(title.trim());
    seen.add(normalized);
  });
  return [...duplicates];
}

export function canEditRubric(access: AssessmentAccess, demoState?: "readonly" | "permission") {
  return access === "editable" && demoState !== "readonly" && demoState !== "permission";
}
