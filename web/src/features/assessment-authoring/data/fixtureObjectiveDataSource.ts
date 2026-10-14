import type { Objective } from "../domain/types";

export const OBJECTIVE_SET_ID = "objective-set-local-001";
export const OBJECTIVE_SET_STORAGE_KEY = "gradeops.local-preview.objective-set";
export const OBJECTIVE_SET_UPDATED_AT = "2026-10-12T00:00:00.000Z";
export const ASSESSMENT_DRAFT_ID = "assessment-draft-local-001";

export const DEMO_AI_OBJECTIVE_PROPOSAL: Objective = {
  id: "objective-demo-ai-functions",
  title: "Descomponer un problema en funciones reutilizables",
  description: "Propuesta demo basada en el material disponible; requiere decisión docente.",
  observableEvidence: "El estudiante implementa y justifica al menos dos funciones con responsabilidades claras.",
  materialIds: ["material-pdf-functions"],
  status: "ready",
  source: "demo-ai",
  aiDecision: "pending",
};
