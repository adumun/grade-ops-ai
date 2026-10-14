import { calculateRubricReadiness } from "../rubricCoverage";
import { canEditRubric, findDuplicateCriteria, validateCriterion, weightState } from "../rubricRules";
import { decideRubricProposal, duplicateRubricVersion } from "../rubricVersioning";
import type { Objective, RubricCriterion, RubricVersion } from "../types";

const criterion: RubricCriterion = { id: "c1", title: "Diseño", description: "", weight: 100, objectiveIds: ["o1"], levels: [{ id: "l1", label: "Logro", descriptor: "Descriptor", score: 4 }] };
const objective: Objective = { id: "o1", title: "Aplicar funciones", description: "", observableEvidence: "Implementa", materialIds: [], status: "ready", source: "manual" };

describe("rubric rules", () => {
  it("validates criteria, required descriptors, non-negative scores and weights", () => {
    expect(validateCriterion({ ...criterion, title: "", weight: -1, levels: [{ ...criterion.levels[0], descriptor: "", score: -2 }] })).toEqual(expect.objectContaining({ isValid: false, errors: expect.arrayContaining(["Cada criterio necesita un nombre.", "El peso debe ser un número no negativo.", "Cada nivel requiere un descriptor.", "Los puntajes no pueden ser negativos."]) }));
  });
  it("reports incomplete, correct and exceeded weights plus duplicate names", () => {
    expect(weightState([{ ...criterion, weight: 80 }]).state).toBe("incomplete");
    expect(weightState([criterion]).state).toBe("correct");
    expect(weightState([{ ...criterion, weight: 101 }]).state).toBe("exceeded");
    expect(findDuplicateCriteria([criterion, { ...criterion, id: "c2", title: " diseño " }])).toEqual(["diseño"]);
  });
  it("calculates readiness and objectives without a criterion", () => {
    const readiness = calculateRubricReadiness([{ ...criterion, objectiveIds: [] }], [objective]);
    expect(readiness.isReady).toBe(false);
    expect(readiness.objectivesWithoutCriterion).toEqual(["Aplicar funciones"]);
    expect(readiness.warnings).toEqual(expect.arrayContaining(["Vincula este criterio con al menos un objetivo."]));
  });
  it("duplicates versions without mutating the original and keeps human decisions explicit", () => {
    const original: RubricVersion = { id: "r1", title: "Base", version: 1, criteria: [criterion], updatedAt: "fixed" };
    const copy = duplicateRubricVersion(original, "r2");
    copy.criteria[0].levels[0].descriptor = "Cambio";
    expect(original.criteria[0].levels[0].descriptor).toBe("Descriptor");
    expect(copy).toEqual(expect.objectContaining({ id: "r2", version: 2, title: "Base (copia)" }));
    expect(decideRubricProposal(original, "accepted").aiDecision).toBe("accepted");
    expect(canEditRubric("editable")).toBe(true);
    expect(canEditRubric("read-only")).toBe(false);
    expect(canEditRubric("editable", "permission")).toBe(false);
  });
});
