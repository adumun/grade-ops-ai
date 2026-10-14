import { OBJECTIVE_SET_STORAGE_KEY } from "../fixtureObjectiveDataSource";
import { localObjectiveDataSource } from "../localObjectiveDataSource";

describe("local objective data source", () => {
  beforeEach(() => window.localStorage.clear());

  it("starts with a deterministic pending AI proposal, saves and recovers objectives", async () => {
    await expect(localObjectiveDataSource.getObjectiveSet()).resolves.toEqual(expect.objectContaining({ objectives: [expect.objectContaining({ aiDecision: "pending", source: "demo-ai" })] }));
    await localObjectiveDataSource.saveObjectiveSet([{ id: "manual", title: "Aplicar funciones", description: "", observableEvidence: "Implementa", materialIds: ["m1"], status: "ready", source: "manual" }]);
    await expect(localObjectiveDataSource.getObjectiveSet()).resolves.toEqual(expect.objectContaining({ objectives: [expect.objectContaining({ id: "manual", title: "Aplicar funciones" })] }));
    expect(window.localStorage.getItem(OBJECTIVE_SET_STORAGE_KEY)).toContain("Aplicar funciones");
  });

  it("resets only the local objective set", async () => {
    await localObjectiveDataSource.saveObjectiveSet([]);
    await localObjectiveDataSource.reset();
    await expect(localObjectiveDataSource.getObjectiveSet()).resolves.toEqual(expect.objectContaining({ objectives: [expect.objectContaining({ aiDecision: "pending" })] }));
  });
});
