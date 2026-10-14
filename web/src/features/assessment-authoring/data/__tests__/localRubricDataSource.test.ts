import { RUBRIC_STORAGE_KEY } from "../fixtureRubricDataSource";
import { localRubricDataSource } from "../localRubricDataSource";

describe("local rubric data source", () => {
  beforeEach(() => window.localStorage.clear());
  it("starts demo/local, persists a draft and resets it", async () => {
    const initial = await localRubricDataSource.getRubric();
    expect(initial.rubric.criteria).toEqual([]);
    const saved = await localRubricDataSource.saveRubric({ ...initial.rubric, title: "Rúbrica persistida", criteria: [{ id: "c1", title: "Criterio", description: "", weight: 100, objectiveIds: [], levels: [] }] });
    expect(saved.title).toBe("Rúbrica persistida");
    expect(window.localStorage.getItem(RUBRIC_STORAGE_KEY)).toContain("Rúbrica persistida");
    await localRubricDataSource.reset();
    await expect(localRubricDataSource.getRubric()).resolves.toEqual(expect.objectContaining({ rubric: expect.objectContaining({ criteria: [] }) }));
  });
});
