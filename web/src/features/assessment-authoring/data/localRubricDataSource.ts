import type { RubricVersion } from "../domain/types";
import type { RubricDataSource } from "./rubricDataSource";
import { cloneRubric, fixtureRubricDataSource, RUBRIC_STORAGE_KEY, RUBRIC_UPDATED_AT } from "./fixtureRubricDataSource";

function canUseStorage() { return typeof window !== "undefined" && Boolean(window.localStorage); }
function isRubric(value: unknown): value is RubricVersion {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<RubricVersion>;
  return typeof item.id === "string" && typeof item.title === "string" && typeof item.version === "number" && Array.isArray(item.criteria);
}
type RubricLibrary = { schemaVersion: 1; currentId: string; rubrics: RubricVersion[] };
function readLibrary(): RubricLibrary {
  const empty: RubricLibrary = { schemaVersion: 1, currentId: "", rubrics: [] };
  if (!canUseStorage()) return empty;
  const raw = window.localStorage.getItem(RUBRIC_STORAGE_KEY);
  if (!raw) return empty;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (isRubric(parsed)) return { schemaVersion: 1, currentId: parsed.id, rubrics: [parsed] };
    const library = parsed as Partial<RubricLibrary> | null;
    if (library?.schemaVersion !== 1 || !Array.isArray(library.rubrics)) return empty;
    return { schemaVersion: 1, currentId: typeof library.currentId === "string" ? library.currentId : "", rubrics: library.rubrics.filter(isRubric) };
  } catch { return empty; }
}

export const localRubricDataSource: RubricDataSource = {
  async getRubric() {
    const fixtures = await fixtureRubricDataSource.getRubric();
    const library = readLibrary();
    const savedIds = new Set(library.rubrics.map(item => item.id));
    const availableRubrics = [...library.rubrics.map(cloneRubric), ...fixtures.availableRubrics.filter(item => !savedIds.has(item.id))];
    const current = library.rubrics.find(item => item.id === library.currentId);
    return { rubric: current ? cloneRubric(current) : fixtures.rubric, availableRubrics };
  },
  async saveRubric(rubric) {
    const saved = { ...cloneRubric(rubric), updatedAt: RUBRIC_UPDATED_AT };
    const library = readLibrary();
    const next: RubricLibrary = { schemaVersion: 1, currentId: saved.id, rubrics: [...library.rubrics.filter(item => item.id !== saved.id), saved] };
    if (canUseStorage()) window.localStorage.setItem(RUBRIC_STORAGE_KEY, JSON.stringify(next));
    return saved;
  },
  async reset() { if (canUseStorage()) window.localStorage.removeItem(RUBRIC_STORAGE_KEY); },
};
