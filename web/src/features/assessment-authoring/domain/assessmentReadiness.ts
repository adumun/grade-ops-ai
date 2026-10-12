import type { AssessmentDraftValues, AssessmentValidation } from "./types";

export function assessAssessmentReadiness(values: AssessmentDraftValues): AssessmentValidation {
  const errors: AssessmentValidation["errors"] = {};
  const warnings: string[] = [];

  if (!values.title.trim()) errors.title = "Ingresa un título para guardar la evaluación.";
  if (!values.topic.trim()) warnings.push("Puedes agregar una temática para orientar la evaluación.");
  if (!values.purpose.trim()) warnings.push("Puedes agregar el propósito pedagógico cuando lo tengas claro.");

  return { errors, warnings, isReady: Object.keys(errors).length === 0 };
}
