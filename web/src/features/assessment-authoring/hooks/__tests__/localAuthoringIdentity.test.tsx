import { act, renderHook } from "@testing-library/react";
import { useRubricDraft } from "../useRubricDraft";
import { useObjectiveSet } from "../useObjectiveSet";

jest.mock("@/components/shell/ShellContext", () => ({ useDemoState: () => ({ demoState: "normal" }) }));

test("criteria keep distinct identity after deletion and subsequent edits", () => {
  const { result } = renderHook(() => useRubricDraft(undefined, "editable"));
  act(() => result.current.addCriterion());
  act(() => result.current.addCriterion());
  act(() => result.current.removeCriterion(result.current.rubric.criteria[0].id));
  const retainedId = result.current.rubric.criteria[0].id;
  act(() => result.current.addCriterion());
  const addedId = result.current.rubric.criteria[1].id;
  expect(addedId).not.toBe(retainedId);
  act(() => result.current.updateCriterion(addedId, "title", "Nuevo"));
  expect(result.current.rubric.criteria[0].title).toBe("");
  expect(result.current.rubric.criteria[1].title).toBe("Nuevo");
});

test("levels keep distinct identity after deletion and subsequent edits", () => {
  const { result } = renderHook(() => useRubricDraft(undefined, "editable"));
  act(() => result.current.addCriterion());
  const criterionId = result.current.rubric.criteria[0].id;
  act(() => result.current.addLevel(criterionId));
  act(() => result.current.removeLevel(criterionId, result.current.rubric.criteria[0].levels[0].id));
  const retainedId = result.current.rubric.criteria[0].levels[0].id;
  act(() => result.current.addLevel(criterionId));
  const addedId = result.current.rubric.criteria[0].levels[1].id;
  expect(addedId).not.toBe(retainedId);
  act(() => result.current.updateLevel(criterionId, addedId, "descriptor", "Nuevo"));
  expect(result.current.rubric.criteria[0].levels[0].descriptor).toBe("");
});

test("objectives retain unique IDs and edits do not touch another objective", () => {
  const { result } = renderHook(() => useObjectiveSet(undefined));
  for (const title of ["Primero", "Segundo"]) {
    act(() => result.current.update("title", title));
    act(() => { result.current.commitObjective(); });
  }
  act(() => result.current.remove(result.current.objectives[0].id));
  const retainedId = result.current.objectives[0].id;
  act(() => result.current.update("title", "Tercero"));
  act(() => { result.current.commitObjective(); });
  const added = result.current.objectives[1];
  expect(added.id).not.toBe(retainedId);
  act(() => result.current.startEdit(added));
  act(() => result.current.update("title", "Editado"));
  act(() => { result.current.commitObjective(); });
  expect(result.current.objectives.map(x => x.title)).toEqual(["Segundo", "Editado"]);
});
