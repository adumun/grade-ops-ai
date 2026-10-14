"use client";

import { useEffect, useRef, useState } from "react";
import { useDemoState } from "@/components/shell/ShellContext";
import { localRubricDataSource } from "../data/localRubricDataSource";
import { EMPTY_LEVEL, canEditRubric } from "../domain/rubricRules";
import { decideRubricProposal, duplicateRubricVersion } from "../domain/rubricVersioning";
import type { AssessmentAccess, RubricAiDecision, RubricCriterion, RubricLevel, RubricVersion } from "../domain/types";

export type RubricSaveState = "idle" | "saving" | "saved" | "error";
const emptyCriterion = (position: number): RubricCriterion => ({ id: `criterion-local-${position}`, title: "", description: "", weight: 0, objectiveIds: [], levels: [{ ...EMPTY_LEVEL, id: `level-local-${position}-1` }] });

export function useRubricDraft(initial: RubricVersion | undefined, access: AssessmentAccess, simulateSaveError = false) {
  const { demoState } = useDemoState();
  const [rubric, setRubric] = useState<RubricVersion>(initial ?? { id: "rubric-local-new", title: "Nueva rúbrica local", version: 1, criteria: [], updatedAt: "2026-10-14T00:00:00.000Z", isDemo: true });
  const [saveState, setSaveState] = useState<RubricSaveState>("idle");
  const hasFailedOnce = useRef(false);
  const canEdit = canEditRubric(access, demoState === "readonly" || demoState === "permission" ? demoState : undefined);
  useEffect(() => { if (initial) setRubric(initial); }, [initial]);
  const change = (next: (current: RubricVersion) => RubricVersion) => { if (canEdit) setRubric(next); };
  const selectBase = (base: RubricVersion) => change(() => ({ ...base, criteria: base.criteria.map((criterion) => ({ ...criterion, objectiveIds: [...criterion.objectiveIds], levels: criterion.levels.map((level) => ({ ...level })) })) }));
  const createNew = () => change(() => ({ id: "rubric-local-new", title: "Nueva rúbrica local", version: 1, criteria: [], updatedAt: rubric.updatedAt, isDemo: true }));
  const duplicate = () => change((current) => duplicateRubricVersion(current, `rubric-local-copy-${current.version + 1}`));
  const updateTitle = (title: string) => change((current) => ({ ...current, title }));
  const addCriterion = () => change((current) => ({ ...current, criteria: [...current.criteria, emptyCriterion(current.criteria.length + 1)] }));
  const updateCriterion = (id: string, field: "title" | "description" | "weight", value: string | number) => change((current) => ({ ...current, criteria: current.criteria.map((criterion) => criterion.id === id ? { ...criterion, [field]: field === "weight" ? Number(value) : value } : criterion) }));
  const toggleObjective = (criterionId: string, objectiveId: string) => change((current) => ({ ...current, criteria: current.criteria.map((criterion) => criterion.id !== criterionId ? criterion : { ...criterion, objectiveIds: criterion.objectiveIds.includes(objectiveId) ? criterion.objectiveIds.filter((id) => id !== objectiveId) : [...criterion.objectiveIds, objectiveId] }) }));
  const removeCriterion = (id: string) => change((current) => ({ ...current, criteria: current.criteria.filter((criterion) => criterion.id !== id) }));
  const moveCriterion = (id: string, direction: -1 | 1) => change((current) => {
    const from = current.criteria.findIndex((criterion) => criterion.id === id); const to = from + direction;
    if (from < 0 || to < 0 || to >= current.criteria.length) return current;
    const criteria = [...current.criteria]; [criteria[from], criteria[to]] = [criteria[to], criteria[from]];
    return { ...current, criteria };
  });
  const addLevel = (criterionId: string) => change((current) => ({ ...current, criteria: current.criteria.map((criterion) => criterion.id !== criterionId ? criterion : { ...criterion, levels: [...criterion.levels, { ...EMPTY_LEVEL, id: `level-local-${criterion.id}-${criterion.levels.length + 1}` }] }) }));
  const updateLevel = (criterionId: string, levelId: string, field: keyof Pick<RubricLevel, "label" | "descriptor" | "score">, value: string | number) => change((current) => ({ ...current, criteria: current.criteria.map((criterion) => criterion.id !== criterionId ? criterion : { ...criterion, levels: criterion.levels.map((level) => level.id === levelId ? { ...level, [field]: field === "score" ? Number(value) : value } : level) }) }));
  const removeLevel = (criterionId: string, levelId: string) => change((current) => ({ ...current, criteria: current.criteria.map((criterion) => criterion.id !== criterionId ? criterion : { ...criterion, levels: criterion.levels.filter((level) => level.id !== levelId) }) }));
  const decideProposal = (decision: Exclude<RubricAiDecision, "pending">) => change((current) => decideRubricProposal(current, decision));
  async function save() {
    if (!canEdit || saveState === "saving") return false;
    setSaveState("saving"); await new Promise((resolve) => setTimeout(resolve, 80));
    if ((demoState === "error" || simulateSaveError) && !hasFailedOnce.current) { hasFailedOnce.current = true; setSaveState("error"); return false; }
    try { setRubric(await localRubricDataSource.saveRubric(rubric)); setSaveState("saved"); return true; } catch { setSaveState("error"); return false; }
  }
  return { rubric, saveState, canEdit, createNew, selectBase, duplicate, updateTitle, addCriterion, updateCriterion, toggleObjective, removeCriterion, moveCriterion, addLevel, updateLevel, removeLevel, decideProposal, save };
}
