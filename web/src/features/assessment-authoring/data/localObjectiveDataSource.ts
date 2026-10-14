import type { ObjectiveSet } from "../domain/types";
import type { ObjectiveDataSource } from "./objectiveDataSource";
import { ASSESSMENT_DRAFT_ID, DEMO_AI_OBJECTIVE_PROPOSAL, OBJECTIVE_SET_ID, OBJECTIVE_SET_STORAGE_KEY, OBJECTIVE_SET_UPDATED_AT } from "./fixtureObjectiveDataSource";

function canUseStorage() { return typeof window !== "undefined" && Boolean(window.localStorage); }
function initialObjectiveSet(): ObjectiveSet { return { id: OBJECTIVE_SET_ID, assessmentDraftId: ASSESSMENT_DRAFT_ID, objectives: [{ ...DEMO_AI_OBJECTIVE_PROPOSAL, materialIds: [...DEMO_AI_OBJECTIVE_PROPOSAL.materialIds] }], updatedAt: OBJECTIVE_SET_UPDATED_AT }; }

export const localObjectiveDataSource: ObjectiveDataSource = {
  async getObjectiveSet() {
    if (!canUseStorage()) return initialObjectiveSet();
    const raw = window.localStorage.getItem(OBJECTIVE_SET_STORAGE_KEY);
    if (!raw) return initialObjectiveSet();
    try {
      const parsed = JSON.parse(raw) as ObjectiveSet;
      return parsed?.id === OBJECTIVE_SET_ID && Array.isArray(parsed.objectives) ? parsed : initialObjectiveSet();
    } catch { return initialObjectiveSet(); }
  },
  async saveObjectiveSet(objectives) {
    const objectiveSet: ObjectiveSet = { id: OBJECTIVE_SET_ID, assessmentDraftId: ASSESSMENT_DRAFT_ID, objectives: objectives.map((objective) => ({ ...objective, materialIds: [...objective.materialIds] })), updatedAt: OBJECTIVE_SET_UPDATED_AT };
    if (canUseStorage()) window.localStorage.setItem(OBJECTIVE_SET_STORAGE_KEY, JSON.stringify(objectiveSet));
    return objectiveSet;
  },
  async reset() { if (canUseStorage()) window.localStorage.removeItem(OBJECTIVE_SET_STORAGE_KEY); },
};
