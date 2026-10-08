import { toDraftViewModel, toAssessmentDraftBuilderPageViewModel } from "../toAssessmentDraftBuilderPageViewModel";
import type { AssessmentDraftDto } from "@/types/assessment";

const baseDraftDto: AssessmentDraftDto = {
  draftId: "draft-1",
  title: "Evaluación de ejemplo",
  context: "Contexto de la evaluación.",
  instructions: "Instrucciones de la evaluación.",
  objectives: ["Objetivo 1"],
  deliverables: ["Entregable 1"],
  constraints: ["Restricción 1"],
  versionNumber: 1,
  origin: "AI_GENERATED",
  actorId: null,
  reason: null,
  previousRevisionId: null,
};

describe("toDraftViewModel", () => {
  it("maps an AI_GENERATED dto preserving all fields", () => {
    const vm = toDraftViewModel(baseDraftDto);
    expect(vm.origin).toBe("AI_GENERATED");
    expect(vm.actorId).toBeNull();
    expect(vm.reason).toBeNull();
    expect(vm.title).toBe("Evaluación de ejemplo");
  });

  it("maps a HUMAN_EDITED dto preserving actorId and reason", () => {
    const dto: AssessmentDraftDto = { ...baseDraftDto, origin: "HUMAN_EDITED", actorId: "teacher-42", reason: "Ajuste de contexto", versionNumber: 2 };
    const vm = toDraftViewModel(dto);
    expect(vm.origin).toBe("HUMAN_EDITED");
    expect(vm.actorId).toBe("teacher-42");
    expect(vm.reason).toBe("Ajuste de contexto");
  });

  it("mapper accepts LEGACY_UNKNOWN and passes it through unchanged", () => {
    const dto: AssessmentDraftDto = { ...baseDraftDto, origin: "LEGACY_UNKNOWN", actorId: null, reason: null };
    const vm = toDraftViewModel(dto);
    expect(vm.origin).toBe("LEGACY_UNKNOWN");
  });

  it("LEGACY_UNKNOWN: actorId null does not cause an error in the mapper", () => {
    const dto: AssessmentDraftDto = { ...baseDraftDto, origin: "LEGACY_UNKNOWN", actorId: null };
    expect(() => toDraftViewModel(dto)).not.toThrow();
    expect(toDraftViewModel(dto).actorId).toBeNull();
  });

  it("LEGACY_UNKNOWN: reason null does not cause an error in the mapper", () => {
    const dto: AssessmentDraftDto = { ...baseDraftDto, origin: "LEGACY_UNKNOWN", reason: null };
    expect(() => toDraftViewModel(dto)).not.toThrow();
    expect(toDraftViewModel(dto).reason).toBeNull();
  });
});

describe("toAssessmentDraftBuilderPageViewModel", () => {
  it("maps a page with a LEGACY_UNKNOWN draft without errors", () => {
    const legacyDto: AssessmentDraftDto = { ...baseDraftDto, origin: "LEGACY_UNKNOWN", actorId: null, reason: null };
    const result = toAssessmentDraftBuilderPageViewModel({ draft: legacyDto, versions: [legacyDto] });
    expect(result.draft.origin).toBe("LEGACY_UNKNOWN");
    expect(result.versions[0].origin).toBe("LEGACY_UNKNOWN");
    expect(result.versions[0].actorId).toBeNull();
    expect(result.versions[0].reason).toBeNull();
  });

  it("preserves LEGACY_UNKNOWN in version list alongside other origins", () => {
    const legacyDto: AssessmentDraftDto = { ...baseDraftDto, origin: "LEGACY_UNKNOWN", actorId: null, reason: null };
    const humanDto: AssessmentDraftDto = { ...baseDraftDto, versionNumber: 2, draftId: "draft-2", origin: "HUMAN_EDITED", actorId: "teacher-42", reason: "Rev", previousRevisionId: "draft-1" };
    const result = toAssessmentDraftBuilderPageViewModel({ draft: humanDto, versions: [legacyDto, humanDto] });
    const legacyVersion = result.versions.find((v) => v.versionNumber === 1);
    const humanVersion = result.versions.find((v) => v.versionNumber === 2);
    expect(legacyVersion?.origin).toBe("LEGACY_UNKNOWN");
    expect(humanVersion?.origin).toBe("HUMAN_EDITED");
  });
});
