"use client";

import { useEffect, useRef, useState } from "react";
import { useDemoState } from "@/components/shell/ShellContext";
import { localContentSetDataSource } from "../data/localContentSetDataSource";
import { validateContentSet, moveMaterial } from "../domain/contentSetRules";
import type { ContentSet, ContentSetValues, Material } from "../domain/types";

export type ContentSetSaveState = "idle" | "saving" | "saved" | "error";
export type ContentSetMode = "existing" | "new";

export function useContentSetDraft(
  initial: ContentSet | undefined,
  fixtures: Material[],
  reusableContentSets: ContentSet[],
  simulateSaveError = false,
) {
  const { demoState } = useDemoState();
  const [values, setValues] = useState<ContentSetValues>({ name: initial?.name ?? "", description: initial?.description ?? "" });
  const [materials, setMaterials] = useState<Material[]>(initial?.materials ?? []);
  const [saveState, setSaveState] = useState<ContentSetSaveState>("idle");
  const [draft, setDraft] = useState(initial);
  const [mode, setMode] = useState<ContentSetMode>(initial?.name ? "existing" : "new");
  const [validationRequested, setValidationRequested] = useState(false);
  const hasFailedOnce = useRef(false);

  useEffect(() => {
    if (!initial || draft?.id === initial.id) return;
    setDraft(initial);
    setValues({ name: initial.name, description: initial.description });
    setMaterials(initial.materials);
    setMode(initial.name ? "existing" : "new");
  }, [draft?.id, initial]);

  const validation = validateContentSet(values);
  const update = (field: keyof ContentSetValues, value: string) => {
    setValidationRequested(false);
    setValues((current) => ({ ...current, [field]: value }));
  };

  const selectContentSet = (id: string) => {
    const selected = reusableContentSets.find((contentSet) => contentSet.id === id);
    if (!selected) return;
    setMode("existing");
    setDraft(selected);
    setValues({ name: selected.name, description: selected.description });
    setMaterials(selected.materials.map((material) => ({ ...material })));
    setValidationRequested(false);
    setSaveState("idle");
  };

  const startNewContentSet = () => {
    setMode("new");
    setDraft(undefined);
    setValues({ name: "", description: "" });
    setMaterials([]);
    setValidationRequested(false);
    setSaveState("idle");
  };

  const addMaterial = (id: string) => {
    const fixture = fixtures.find((item) => item.id === id);
    if (fixture && !materials.some((item) => item.id === id)) setMaterials((current) => [...current, { ...fixture }]);
  };
  const removeMaterial = (id: string) => setMaterials((current) => current.filter((item) => item.id !== id));
  const reorderMaterial = (index: number, direction: -1 | 1) => setMaterials((current) => moveMaterial(current, index, direction));

  async function save() {
    setValidationRequested(true);
    if (!validation.isReady || demoState === "readonly" || demoState === "permission") return false;
    setSaveState("saving");
    await new Promise((resolve) => setTimeout(resolve, 80));
    if ((demoState === "error" || simulateSaveError) && !hasFailedOnce.current) {
      hasFailedOnce.current = true;
      setSaveState("error");
      return false;
    }
    try {
      const next = await localContentSetDataSource.saveContentSet(values, materials, draft?.id);
      setDraft(next);
      setValues({ name: next.name, description: next.description });
      setMaterials(next.materials);
      setMode("existing");
      setSaveState("saved");
      return true;
    } catch {
      setSaveState("error");
      return false;
    }
  }

  return {
    values,
    materials,
    draft,
    fixtures,
    reusableContentSets,
    mode,
    validation,
    validationRequested,
    saveState,
    update,
    selectContentSet,
    startNewContentSet,
    addMaterial,
    removeMaterial,
    reorderMaterial,
    save,
    canEdit: demoState !== "readonly" && demoState !== "permission",
  };
}
