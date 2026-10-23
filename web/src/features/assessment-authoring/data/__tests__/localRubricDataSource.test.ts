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

  it("preserves a saved original and its edited copy across reloads", async () => {
    const { rubric } = await localRubricDataSource.getRubric();
    const original = { ...rubric, id: "original", title: "Original" };
    await localRubricDataSource.saveRubric(original);
    await localRubricDataSource.saveRubric({ ...original, id: "copy", version: 2, title: "Copia" });
    const loaded = await localRubricDataSource.getRubric();
    expect(loaded.rubric.id).toBe("copy");
    expect(loaded.availableRubrics.find(x => x.id === "original")).toEqual(original);
    expect(loaded.availableRubrics.find(x => x.id === "copy")?.version).toBe(2);
    await localRubricDataSource.saveRubric({ ...loaded.rubric, title: "Copia editada" });
    expect((await localRubricDataSource.getRubric()).availableRubrics.find(x => x.id === "original")?.title).toBe("Original");
  });

  it("reads the legacy rubric and retains it when saving a new one", async () => {
    const { rubric } = await localRubricDataSource.getRubric();
    window.localStorage.setItem(RUBRIC_STORAGE_KEY, JSON.stringify({ ...rubric, id: "legacy" }));
    expect((await localRubricDataSource.getRubric()).rubric.id).toBe("legacy");
    await localRubricDataSource.saveRubric({ ...rubric, id: "new" });
    expect((await localRubricDataSource.getRubric()).availableRubrics.map(x => x.id)).toEqual(expect.arrayContaining(["legacy", "new"]));
  });

});
