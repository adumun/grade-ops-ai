"use client";

import { useEffect, useRef, useState } from "react";
import { useDemoState } from "@/components/shell/ShellContext";
import { localObjectiveDataSource } from "../data/localObjectiveDataSource";
import { createObjective, toObjectiveValues, validateObjective } from "../domain/objectiveRules";
import type { Objective, ObjectiveSet, ObjectiveValues } from "../domain/types";

export type ObjectiveSaveState = "idle" | "saving" | "saved" | "error";

export function useObjectiveSet(initial: ObjectiveSet | undefined, simulateSaveError = false) {
  const { demoState } = useDemoState();
  const [objectives, setObjectives] = useState<Objective[]>(initial?.objectives ?? []);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [values, setValues] = useState<ObjectiveValues>(toObjectiveValues());
  const [saveState, setSaveState] = useState<ObjectiveSaveState>("idle");
  const hasFailedOnce = useRef(false);
  useEffect(() => {
    if (!initial) return;
    setObjectives(initial.objectives);
  }, [initial]);
  const validation = validateObjective(values);
  const update = (field: keyof ObjectiveValues, value: string | string[]) => setValues((current) => ({ ...current, [field]: value } as ObjectiveValues));
  const toggleMaterial = (materialId: string) => setValues((current) => ({ ...current, materialIds: current.materialIds.includes(materialId) ? current.materialIds.filter((id) => id !== materialId) : [...current.materialIds, materialId] }));
  const startEdit = (objective: Objective) => { setEditingId(objective.id); setValues(toObjectiveValues(objective)); };
  const cancelEdit = () => { setEditingId(null); setValues(toObjectiveValues()); };
  const commitObjective = () => {
    if (!validation.isReady) return false;
    setObjectives((current) => editingId ? current.map((objective) => objective.id === editingId ? createObjective(objective.id, values, objective.source, objective.source === "demo-ai" ? "edited" : objective.aiDecision) : objective) : [...current, createObjective(`objective-local-manual-${current.length + 1}`, values)]);
    cancelEdit();
    return true;
  };
  const remove = (id: string) => setObjectives((current) => current.filter((objective) => objective.id !== id));
  const decideProposal = (id: string, decision: "accepted" | "rejected") => setObjectives((current) => current.map((objective) => objective.id === id ? { ...objective, aiDecision: decision } : objective));
  async function save() {
    if (demoState === "readonly" || demoState === "permission" || saveState === "saving") return false;
    setSaveState("saving");
    await new Promise((resolve) => setTimeout(resolve, 80));
    if ((demoState === "error" || simulateSaveError) && !hasFailedOnce.current) { hasFailedOnce.current = true; setSaveState("error"); return false; }
    try { const saved = await localObjectiveDataSource.saveObjectiveSet(objectives); setObjectives(saved.objectives); setSaveState("saved"); return true; }
    catch { setSaveState("error"); return false; }
  }
  return { objectives, values, editingId, validation, saveState, canEdit: demoState !== "readonly" && demoState !== "permission", update, toggleMaterial, startEdit, cancelEdit, commitObjective, remove, decideProposal, save };
}
