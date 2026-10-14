import type { RubricAiDecision, RubricVersion } from "./types";

export function duplicateRubricVersion(rubric: RubricVersion, id: string): RubricVersion {
  return {
    ...rubric,
    id,
    title: `${rubric.title} (copia)`,
    version: rubric.version + 1,
    aiDecision: undefined,
    criteria: rubric.criteria.map((criterion) => ({ ...criterion, objectiveIds: [...criterion.objectiveIds], levels: criterion.levels.map((level) => ({ ...level })) })),
  };
}

export function decideRubricProposal(rubric: RubricVersion, decision: Exclude<RubricAiDecision, "pending">): RubricVersion {
  return { ...rubric, aiDecision: decision };
}
