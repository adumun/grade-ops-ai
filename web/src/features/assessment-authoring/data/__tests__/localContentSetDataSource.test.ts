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

  it("keeps multiple content sets, associations and updates across reloads", async () => {
    const source = localContentSetDataSource;
    await source.saveContentSet({ name: "A", description: "" }, [], "a");
    await source.saveContentSet({ name: "B", description: "" }, [], "b");
    await source.saveAssociation(["a", "b"]);
    await source.saveContentSet({ name: "A editado", description: "" }, [], "a");
    const library = await source.listReusableContentSets();
    expect(library.find(x => x.id === "a")?.name).toBe("A editado");
    expect(library.find(x => x.id === "b")?.name).toBe("B");
    expect(library.filter(x => x.id === "a")).toHaveLength(1);
    await expect(source.getAssociatedContentSetIds()).resolves.toEqual(["a", "b"]);
  });

  it("reads the legacy single content set and preserves it on the next save", async () => {
    const legacy = { id: "legacy", name: "Anterior", description: "", materials: [], status: "draft", updatedAt: "2026-10-01" };
    window.localStorage.setItem(CONTENT_SET_STORAGE_KEY, JSON.stringify(legacy));
    expect((await localContentSetDataSource.getContentSet()).id).toBe("legacy");
    await localContentSetDataSource.saveContentSet({ name: "Nuevo", description: "" }, [], "new");
    expect((await localContentSetDataSource.listReusableContentSets()).map(x => x.id)).toEqual(expect.arrayContaining(["legacy", "new"]));
  });

});
