import { assessAssessmentReadiness } from "../assessmentReadiness";

describe("assessment readiness", () => {
  it("requires only a title to save the first local draft", () => {
    expect(assessAssessmentReadiness({ title: " ", topic: "", purpose: "" })).toMatchObject({ isReady: false, errors: { title: expect.any(String) } });
    expect(assessAssessmentReadiness({ title: "Diagnóstico", topic: "", purpose: "" })).toMatchObject({ isReady: true, warnings: expect.any(Array) });
  });

  it("does not warn when the three minimum fields are complete", () => {
    expect(assessAssessmentReadiness({ title: "Diagnóstico", topic: "Funciones", purpose: "Demostrar composición" })).toEqual({ errors: {}, warnings: [], isReady: true });
  });
});
