import { assessAssessmentReadiness } from "../assessmentReadiness";

describe("assessment readiness", () => {
  it("requires title, topic and purpose before saving or advancing", () => {
    expect(assessAssessmentReadiness({ title: " ", topic: "", purpose: "" })).toMatchObject({
      isReady: false,
      errors: {
        title: expect.any(String),
        topic: expect.any(String),
        purpose: expect.any(String),
      },
    });
    expect(assessAssessmentReadiness({ title: "Diagnóstico", topic: "Funciones", purpose: "" })).toMatchObject({
      isReady: false,
      errors: { purpose: expect.any(String) },
    });
  });

  it("does not warn when the three required fields are complete", () => {
    expect(assessAssessmentReadiness({ title: "Diagnóstico", topic: "Funciones", purpose: "Demostrar composición" })).toEqual({
      errors: {},
      warnings: [],
      isReady: true,
    });
  });
});
