import type { AssessmentDraftValues, AssessmentValidation } from "./types";

export function assessAssessmentReadiness(values: AssessmentDraftValues): AssessmentValidation {
  const errors: AssessmentValidation["errors"] = {};

  if (!values.title.trim()) errors.title = "Ingresa un título para guardar la evaluación.";
  if (!values.topic.trim()) errors.topic = "Ingresa una temática para orientar la evaluación.";
  if (!values.purpose.trim()) errors.purpose = "Ingresa un propósito pedagógico o genera una propuesta con IA.";

  return { errors, warnings: [], isReady: Object.keys(errors).length === 0 };
}
