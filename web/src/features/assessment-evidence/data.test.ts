import { ASSESSMENTS, getAssessment } from "./data";

describe("WEBUI-003 deterministic fixtures", () => {
  it("keeps lifecycle dimensions independent and includes the required scenarios", () => {
    expect(getAssessment("api-rest-section-b").lifecycle).toHaveLength(7);
    expect(getAssessment("api-rest-section-b").lifecycle.map((step) => step.label)).toEqual(["Preparación", "Entrega", "Corrección", "Revisión docente", "Feedback IA", "Aprobación", "Publicación"]);
    expect(getAssessment("quarterly-progress-report").publishable).toBe(true);
    expect(getAssessment("published").status).toBe("Publicado");
    expect(getAssessment("ecosystems-research").proposal).toBeNull();
  });

  it("models human capabilities separately from AI proposal data", () => {
    expect(getAssessment("api-rest-section-b").proposal?.provider).toContain("demo");
    expect(getAssessment("api-rest-section-b").capabilities).toEqual(expect.arrayContaining(["review", "adjust", "reevaluate", "approve"]));
    expect(getAssessment("quarterly-progress-report").capabilities).not.toContain("approve");
    expect(getAssessment("quarterly-progress-report").capabilities).toContain("publish");
    expect(ASSESSMENTS["published"].capabilities).not.toContain("publish");
  });

  it("falls back deterministically for an unknown route id", () => {
    expect(getAssessment("unknown").id).toBe("api-rest-section-b");
  });
});
