import type { RubricCriterion, RubricVersion } from "../domain/types";

export const RUBRIC_STORAGE_KEY = "gradeops.local-preview.rubric";
export const RUBRIC_UPDATED_AT = "2026-10-14T00:00:00.000Z";

const completeCriteria: RubricCriterion[] = [{
  id: "criterion-demo-design", title: "Diseño de funciones", description: "Evalúa responsabilidades y composición.", weight: 100,
  objectiveIds: ["objective-demo-ai-functions"],
  levels: [
    { id: "level-demo-achieved", label: "Logro esperado", descriptor: "Implementa funciones pequeñas, reutilizables y justificadas.", score: 4 },
    { id: "level-demo-progress", label: "En progreso", descriptor: "Implementa funciones, pero mezcla responsabilidades o no las justifica.", score: 2 },
  ],
}];

function clone(criteria: RubricCriterion[]) { return criteria.map((criterion) => ({ ...criterion, objectiveIds: [...criterion.objectiveIds], levels: criterion.levels.map((level) => ({ ...level })) })); }
export function cloneRubric(rubric: RubricVersion): RubricVersion { return { ...rubric, criteria: clone(rubric.criteria) }; }

export const EMPTY_RUBRIC: RubricVersion = { id: "rubric-local-empty", title: "Nueva rúbrica local", version: 1, criteria: [], updatedAt: RUBRIC_UPDATED_AT, isDemo: true };
export const COMPLETE_RUBRIC: RubricVersion = { id: "rubric-demo-functions", title: "Rúbrica: funciones reutilizables", version: 1, criteria: completeCriteria, updatedAt: RUBRIC_UPDATED_AT, isDemo: true };
export const CRITERION_WITHOUT_OBJECTIVE_RUBRIC: RubricVersion = { ...COMPLETE_RUBRIC, id: "rubric-demo-no-objective", criteria: [{ ...completeCriteria[0], objectiveIds: [] }] };
export const CRITERION_WITHOUT_LEVELS_RUBRIC: RubricVersion = { ...COMPLETE_RUBRIC, id: "rubric-demo-no-levels", criteria: [{ ...completeCriteria[0], levels: [] }] };
export const INCOMPLETE_WEIGHTS_RUBRIC: RubricVersion = { ...COMPLETE_RUBRIC, id: "rubric-demo-incomplete-weights", criteria: [{ ...completeCriteria[0], weight: 60 }] };
export const EXCEEDED_WEIGHTS_RUBRIC: RubricVersion = { ...COMPLETE_RUBRIC, id: "rubric-demo-exceeded-weights", criteria: [{ ...completeCriteria[0], weight: 110 }] };
export const AI_PROPOSAL_PENDING_RUBRIC: RubricVersion = { ...COMPLETE_RUBRIC, id: "rubric-demo-ai-pending", title: "Propuesta IA demo: funciones", aiDecision: "pending" };
export const AI_PROPOSAL_ACCEPTED_RUBRIC: RubricVersion = { ...AI_PROPOSAL_PENDING_RUBRIC, id: "rubric-demo-ai-accepted", aiDecision: "accepted" };
export const AI_PROPOSAL_EDITED_RUBRIC: RubricVersion = { ...AI_PROPOSAL_PENDING_RUBRIC, id: "rubric-demo-ai-edited", aiDecision: "edited" };
export const AI_PROPOSAL_REJECTED_RUBRIC: RubricVersion = { ...AI_PROPOSAL_PENDING_RUBRIC, id: "rubric-demo-ai-rejected", aiDecision: "rejected" };
export const READ_ONLY_RUBRIC: RubricVersion = { ...COMPLETE_RUBRIC, id: "rubric-demo-readonly" };
export const INSUFFICIENT_PERMISSION_RUBRIC: RubricVersion = { ...COMPLETE_RUBRIC, id: "rubric-demo-permission" };
export const RECOVERABLE_ERROR_RUBRIC: RubricVersion = { ...EMPTY_RUBRIC, id: "rubric-demo-error" };
export const DUPLICATED_VERSION_RUBRIC: RubricVersion = { ...COMPLETE_RUBRIC, id: "rubric-demo-duplicate", title: "Rúbrica: funciones reutilizables (copia)", version: 2 };

export const fixtureRubricDataSource = {
  async getRubric() { return { rubric: cloneRubric(EMPTY_RUBRIC), availableRubrics: [COMPLETE_RUBRIC, AI_PROPOSAL_PENDING_RUBRIC].map(cloneRubric) }; },
};
