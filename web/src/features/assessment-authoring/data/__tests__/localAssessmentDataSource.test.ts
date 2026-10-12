import { localAssessmentDataSource, ASSESSMENT_DRAFT_STORAGE_KEY } from "../localAssessmentDataSource";

describe("local assessment data source", () => {
  beforeEach(() => window.localStorage.clear());

  it("starts empty, saves and recovers a deterministic draft", async () => {
    expect(await localAssessmentDataSource.listDrafts()).toEqual([]);
    await localAssessmentDataSource.saveDraft({ title: "Diagnóstico", topic: "Funciones", purpose: "Demostrar composición" });
    expect(await localAssessmentDataSource.listDrafts()).toEqual([expect.objectContaining({ id: "assessment-draft-local-001", status: "draft", title: "Diagnóstico" })]);
    expect(window.localStorage.getItem(ASSESSMENT_DRAFT_STORAGE_KEY)).toContain("Diagnóstico");
  });

  it("resets local demo data", async () => {
    await localAssessmentDataSource.saveDraft({ title: "Temporal", topic: "", purpose: "" });
    await localAssessmentDataSource.reset();
    expect(await localAssessmentDataSource.listDrafts()).toEqual([]);
  });
});
