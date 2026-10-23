"use client";

import { useEffect, useRef, useState } from "react";
import { useDemoState } from "@/components/shell/ShellContext";
import { localContentSetDataSource } from "../data/localContentSetDataSource";
import { createLocalId } from "../domain/localIdentity";
import type { ContentSet, ContentSetValues, Material } from "../domain/types";

export type ContentSetSaveState = "idle" | "saving" | "saved" | "error";
export type ContentSetMode = "existing" | "new";

type NewContentValues = ContentSetValues & { materialIds: string[] };

export function useContentSetDraft(
  initial: ContentSet | undefined,
  fixtures: Material[],
  reusableContentSets: ContentSet[],
  associatedContentSetIds: string[] = [],
  simulateSaveError = false,
) {
  const { demoState } = useDemoState();
  const initialSelectedIds = associatedContentSetIds.length > 0 ? associatedContentSetIds : initial?.name ? [initial.id] : [];
  const [availableContentSets, setAvailableContentSets] = useState<ContentSet[]>(reusableContentSets);
  const [selectedContentSetIds, setSelectedContentSetIds] = useState<string[]>(initialSelectedIds);
  const [pendingNewId, setPendingNewId] = useState<string>();
  const [values, setValues] = useState<ContentSetValues>({ name: initial?.name ?? "", description: initial?.description ?? "" });
  const [materials, setMaterials] = useState<Material[]>(initial?.materials ?? []);
  const [saveState, setSaveState] = useState<ContentSetSaveState>("idle");
  const [draft, setDraft] = useState(initial);
  const [validationRequested, setValidationRequested] = useState(false);
  const hasFailedOnce = useRef(false);

  useEffect(() => {
    setAvailableContentSets(reusableContentSets);
  }, [reusableContentSets]);

  useEffect(() => {
    if (!initial) return;
    setDraft(initial);
    setValues({ name: initial.name, description: initial.description });
    setMaterials(initial.materials);
    setSelectedContentSetIds(initialSelectedIds);
    setPendingNewId(undefined);
  // Initial data is the source snapshot; selection changes must not reset the screen.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial]);

  const primarySelected = selectedContentSetIds
    .map((id) => availableContentSets.find((contentSet) => contentSet.id === id))
    .find((contentSet): contentSet is ContentSet => Boolean(contentSet));
  const validation = { errors: {}, isReady: selectedContentSetIds.length > 0 };
  const update = (field: keyof ContentSetValues, value: string) => {
    setValidationRequested(false);
    setValues((current) => ({ ...current, [field]: value }));
  };

  const selectContentSet = (id: string) => {
    const selected = availableContentSets.find((contentSet) => contentSet.id === id);
    if (!selected) return;
    setSelectedContentSetIds((current) => current.includes(id) ? current.filter((currentId) => currentId !== id) : [...current, id]);
    setPendingNewId(id.startsWith("new-content-") ? id : undefined);
    setDraft(selected);
    setValues({ name: selected.name, description: selected.description });
    setMaterials(selected.materials.map((material) => ({ ...material })));
    setValidationRequested(false);
    setSaveState("idle");
  };

  const removeContentSet = (id: string) => {
    setSelectedContentSetIds((current) => current.filter((currentId) => currentId !== id));
    if (id === pendingNewId) {
      setPendingNewId(undefined);
      setAvailableContentSets((current) => current.filter((contentSet) => contentSet.id !== id));
      setDraft(undefined);
      setValues({ name: "", description: "" });
      setMaterials([]);
    }
    setSaveState("idle");
  };

  const createNewContentSet = ({ name, description, materialIds }: NewContentValues) => {
    const id = createLocalId("new-content");
    const newContentSet: ContentSet = {
      id,
      name,
      description,
      materials: materialIds.map((materialId) => fixtures.find((material) => material.id === materialId)).filter((material): material is Material => Boolean(material)).map((material) => ({ ...material })),
      status: "draft",
      updatedAt: new Date().toISOString(),
    };
    setAvailableContentSets((current) => [...current.filter((contentSet) => !contentSet.id.startsWith("new-content-")), newContentSet]);
    setSelectedContentSetIds((current) => [...current.filter((currentId) => !currentId.startsWith("new-content-")), id]);
    setPendingNewId(id);
    setDraft(undefined);
    setValues({ name, description });
    setMaterials(newContentSet.materials);
    setValidationRequested(false);
    setSaveState("idle");
  };

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
      let idsToSave = selectedContentSetIds;
      if (pendingNewId) {
        const next = await localContentSetDataSource.saveContentSet(values, materials);
        setAvailableContentSets((current) => [...current.filter((contentSet) => contentSet.id !== pendingNewId), next]);
        idsToSave = selectedContentSetIds.map((id) => id === pendingNewId ? next.id : id);
        setSelectedContentSetIds(idsToSave);
        setDraft(next);
        setPendingNewId(undefined);
      }
      await localContentSetDataSource.saveAssociation(idsToSave);
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
    draft: primarySelected ?? draft,
    fixtures,
    reusableContentSets: availableContentSets,
    selectedContentSetIds,
    mode: pendingNewId ? "new" as const : selectedContentSetIds.length > 0 ? "existing" as const : "new" as const,
    validation,
    validationRequested,
    saveState,
    update,
    selectContentSet,
    removeContentSet,
    createNewContentSet,
    save,
    canEdit: demoState !== "readonly" && demoState !== "permission",
  };
}
