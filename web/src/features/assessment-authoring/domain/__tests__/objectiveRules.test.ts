import { calculateObjectiveCoverage } from "../objectiveCoverage";
import { createObjective, getObjectiveStatus, validateObjective } from "../objectiveRules";
import type { Material, Objective } from "../types";

const materials: Material[] = [
  { id: "m1", name: "Guía de funciones", type: "pdf", status: "ready", sourceLabel: "Demo" },
  { id: "m2", name: "Taller", type: "pptx", status: "ready", sourceLabel: "Demo" },
];

describe("objective rules", () => {
  it("requires a measurable title but keeps evidence and materials as visible warnings", () => {
    expect(validateObjective({ title: "", description: "", observableEvidence: "", materialIds: [] })).toEqual(expect.objectContaining({ isReady: false, errors: { title: "Ingresa un objetivo medible." } }));
    const incomplete = validateObjective({ title: "Aplicar funciones", description: "", observableEvidence: "", materialIds: [] });
    expect(incomplete.isReady).toBe(true);
    expect(incomplete.warnings).toEqual(["Falta definir qué debe poder demostrar el estudiante.", "Vincula al menos un material que respalde este objetivo."]);
  });

  it("marks complete objectives as ready and keeps incomplete ones under review", () => {
    expect(getObjectiveStatus({ title: "Aplicar", description: "", observableEvidence: "Implementa", materialIds: ["m1"] })).toBe("ready");
    expect(getObjectiveStatus({ title: "Aplicar", description: "", observableEvidence: "", materialIds: ["m1"] })).toBe("needs_review");
    expect(createObjective("o1", { title: " Aplicar ", description: "", observableEvidence: " Observar ", materialIds: ["m1"] }).title).toBe("Aplicar");
  });

  it("calculates coverage and excludes unresolved AI proposals from final objectives", () => {
    const objectives: Objective[] = [
      { id: "ready", title: "Aplicar", description: "", observableEvidence: "Implementa", materialIds: ["m1"], status: "ready", source: "manual" },
      { id: "missing", title: "Explicar", description: "", observableEvidence: "", materialIds: [], status: "needs_review", source: "manual" },
      { id: "proposal", title: "Propuesta", description: "", observableEvidence: "Demo", materialIds: ["m2"], status: "ready", source: "demo-ai", aiDecision: "pending" },
    ];
    expect(calculateObjectiveCoverage(objectives, materials)).toEqual(expect.objectContaining({ total: 2, ready: 1, withoutEvidence: 1, withoutMaterials: 1, contentCoveragePercent: 50 }));
  });
});
