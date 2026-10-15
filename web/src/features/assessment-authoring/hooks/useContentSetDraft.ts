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
  associatedContentSetIds: string[] = [],
  simulateSaveError = false,
) {
  const { demoState } = useDemoState();
  const initialSelectedIds = associatedContentSetIds.length > 0 ? associatedContentSetIds : initial?.name ? [initial.id] : [];
  const [values, setValues] = useState<ContentSetValues>({ name: initial?.name ?? "", description: initial?.description ?? "" });
  const [materials, setMaterials] = useState<Material[]>(initial?.materials ?? []);
  const [saveState, setSaveState] = useState<ContentSetSaveState>("idle");
  const [draft, setDraft] = useState(initial);
  const [selectedContentSetIds, setSelectedContentSetIds] = useState<string[]>(initialSelectedIds);
  const [mode, setMode] = useState<ContentSetMode>(initialSelectedIds.length > 0 ? "existing" : "new");
  const [validationRequested, setValidationRequested] = useState(false);
  const hasFailedOnce = useRef(false);

  useEffect(() => {
    if (!initial) return;
    setDraft(initial);
    setValues({ name: initial.name, description: initial.description });
    setMaterials(initial.materials);
    setSelectedContentSetIds(initialSelectedIds);
    setMode(initialSelectedIds.length > 0 ? "existing" : "new");
  // The initial data object is the source snapshot; do not reset on selection changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial]);

  const validation = validateContentSet(values);
  const update = (field: keyof ContentSetValues, value: string) => {
    setValidationRequested(false);
    setValues((current) => ({ ...current, [field]: value }));
  };

  const selectContentSet = (id: string) => {
    const selected = reusableContentSets.find((contentSet) => contentSet.id === id);
    if (!selected) return;
    setSelectedContentSetIds((current) => {
      const nextIds = current.includes(id) ? current.filter((currentId) => currentId !== id) : [...current, id];
      const primary = nextIds.map((contentSetId) => reusableContentSets.find((contentSet) => contentSet.id === contentSetId)).find((item): item is ContentSet => Boolean(item));
      if (primary) {
        setDraft(primary);
        setValues({ name: primary.name, description: primary.description });
        setMaterials(primary.materials.map((material) => ({ ...material })));
        setMode("existing");
      } else {
        setDraft(undefined);
        setValues({ name: "", description: "" });
        setMaterials([]);
        setMode("new");
      }
      return nextIds;
    });
    setValidationRequested(false);
    setSaveState("idle");
  };

  const startNewContentSet = () => {
    setMode("new");
    setDraft(undefined);
    setSelectedContentSetIds([]);
    setValues({ name: "", description: "" });
    setMaterials([]);
    setValidationRequested(false);
    setSaveState("idle");
  };

  const createNewContentSet = (nextValues: ContentSetValues) => {
    startNewContentSet();
    setValues(nextValues);
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
      if (mode === "existing" && selectedContentSetIds.length > 0) {
        await localContentSetDataSource.saveAssociation(selectedContentSetIds);
        setSaveState("saved");
        return true;
      }
      const next = await localContentSetDataSource.saveContentSet(values, materials);
      await localContentSetDataSource.saveAssociation([next.id]);
      setDraft(next);
      setValues({ name: next.name, description: next.description });
      setMaterials(next.materials);
      setSelectedContentSetIds([next.id]);
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
    selectedContentSetIds,
    mode,
    validation,
    validationRequested,
    saveState,
    update,
    selectContentSet,
    startNewContentSet,
    createNewContentSet,
    addMaterial,
    removeMaterial,
    reorderMaterial,
    save,
    canEdit: demoState !== "readonly" && demoState !== "permission",
  };
}
