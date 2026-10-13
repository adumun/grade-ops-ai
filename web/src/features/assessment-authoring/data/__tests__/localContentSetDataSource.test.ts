import { CONTENT_SET_STORAGE_KEY } from "../fixtureContentSetDataSource";
import { localContentSetDataSource } from "../localContentSetDataSource";

describe("local content set data source", () => {
  beforeEach(() => window.localStorage.clear());

  it("starts empty, saves and recovers the deterministic draft", async () => {
    expect((await localContentSetDataSource.getContentSet()).materials).toEqual([]);
    await localContentSetDataSource.saveContentSet({ name: "Funciones", description: "Material base" }, [{ id: "m1", name: "Nota", type: "text", status: "ready", sourceLabel: "Demo" }]);
    await expect(localContentSetDataSource.getContentSet()).resolves.toEqual(expect.objectContaining({ name: "Funciones", description: "Material base" }));
    expect(window.localStorage.getItem(CONTENT_SET_STORAGE_KEY)).toContain("Funciones");
  });

  it("resets the local demo content", async () => {
    await localContentSetDataSource.saveContentSet({ name: "Temporal", description: "" }, []);
    await localContentSetDataSource.reset();
    expect((await localContentSetDataSource.getContentSet()).name).toBe("");
  });
});
