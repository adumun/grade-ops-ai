import type { RubricVersion } from "../domain/types";
import type { RubricDataSource } from "./rubricDataSource";
import { cloneRubric, fixtureRubricDataSource, RUBRIC_STORAGE_KEY, RUBRIC_UPDATED_AT } from "./fixtureRubricDataSource";

function canUseStorage() { return typeof window !== "undefined" && Boolean(window.localStorage); }
function isRubric(value: unknown): value is RubricVersion { return Boolean(value && typeof value === "object" && "id" in value && "criteria" in value && Array.isArray((value as RubricVersion).criteria)); }

export const localRubricDataSource: RubricDataSource = {
  async getRubric() {
    const fixtures = await fixtureRubricDataSource.getRubric();
    if (!canUseStorage()) return fixtures;
    const raw = window.localStorage.getItem(RUBRIC_STORAGE_KEY);
    if (!raw) return fixtures;
    try {
      const parsed = JSON.parse(raw) as RubricVersion;
      return isRubric(parsed) ? { rubric: cloneRubric(parsed), availableRubrics: fixtures.availableRubrics } : fixtures;
    } catch { return fixtures; }
  },
  async saveRubric(rubric) {
    const saved = { ...cloneRubric(rubric), updatedAt: RUBRIC_UPDATED_AT };
    if (canUseStorage()) window.localStorage.setItem(RUBRIC_STORAGE_KEY, JSON.stringify(saved));
    return saved;
  },
  async reset() { if (canUseStorage()) window.localStorage.removeItem(RUBRIC_STORAGE_KEY); },
};
