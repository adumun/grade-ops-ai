import { moveMaterial, validateContentSet } from "../contentSetRules";
import type { Material } from "../types";

const materials: Material[] = [
  { id: "one", name: "Uno", type: "text", status: "ready", sourceLabel: "Demo" },
  { id: "two", name: "Dos", type: "pdf", status: "processing", sourceLabel: "Demo" },
];

describe("content set rules", () => {
  it("requires a name but allows an optional description", () => {
    expect(validateContentSet({ name: "", description: "" }).isReady).toBe(false);
    expect(validateContentSet({ name: "  Funciones  ", description: "" })).toEqual({ errors: {}, isReady: true });
  });

  it("moves materials without mutating the original or crossing the list edges", () => {
    expect(moveMaterial(materials, 1, -1).map((material) => material.id)).toEqual(["two", "one"]);
    expect(moveMaterial(materials, 0, -1)).toBe(materials);
    expect(materials.map((material) => material.id)).toEqual(["one", "two"]);
  });
});
