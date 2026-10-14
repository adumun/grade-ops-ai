import type { Objective, ObjectiveStatus, ObjectiveValidation, ObjectiveValues } from "./types";

export function isObjectiveProposal(objective: Objective) {
  return objective.source === "demo-ai" && (objective.aiDecision === "pending" || objective.aiDecision === "rejected");
}

export function getObjectiveStatus(values: ObjectiveValues): ObjectiveStatus {
  if (!values.title.trim() || !values.observableEvidence.trim() || values.materialIds.length === 0) return "needs_review";
  return "ready";
}

export function validateObjective(values: ObjectiveValues): ObjectiveValidation {
  const errors: ObjectiveValidation["errors"] = {};
  const warnings: string[] = [];
  if (!values.title.trim()) errors.title = "Ingresa un objetivo medible.";
  if (!values.observableEvidence.trim()) warnings.push("Falta definir qué debe poder demostrar el estudiante.");
  if (values.materialIds.length === 0) warnings.push("Vincula al menos un material que respalde este objetivo.");
  return { errors, warnings, isReady: Object.keys(errors).length === 0 };
}

export function toObjectiveValues(objective?: Objective): ObjectiveValues {
  return {
    title: objective?.title ?? "",
    description: objective?.description ?? "",
    observableEvidence: objective?.observableEvidence ?? "",
    materialIds: objective?.materialIds ?? [],
  };
}

export function createObjective(id: string, values: ObjectiveValues, source: Objective["source"] = "manual", aiDecision?: Objective["aiDecision"]): Objective {
  return { id, ...values, title: values.title.trim(), description: values.description.trim(), observableEvidence: values.observableEvidence.trim(), status: getObjectiveStatus(values), source, aiDecision };
}
