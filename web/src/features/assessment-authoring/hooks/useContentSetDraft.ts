"use client";

import { useEffect, useRef, useState } from "react";
import { useDemoState } from "@/components/shell/ShellContext";
import { localContentSetDataSource } from "../data/localContentSetDataSource";
import { validateContentSet, moveMaterial } from "../domain/contentSetRules";
import type { ContentSet, ContentSetValues, Material } from "../domain/types";

export type ContentSetSaveState = "idle" | "saving" | "saved" | "error";

export function useContentSetDraft(initial: ContentSet | undefined, fixtures: Material[], simulateSaveError = false) {
  const { demoState } = useDemoState();
  const [values, setValues] = useState<ContentSetValues>({ name: initial?.name ?? "", description: initial?.description ?? "" });
  const [materials, setMaterials] = useState<Material[]>(initial?.materials ?? []);
  const [saveState, setSaveState] = useState<ContentSetSaveState>("idle");
  const [draft, setDraft] = useState(initial);
  const hasFailedOnce = useRef(false);
  useEffect(() => {
    if (!initial || draft?.id === initial.id) return;
    setDraft(initial); setValues({ name: initial.name, description: initial.description }); setMaterials(initial.materials);
  }, [draft?.id, initial]);
  const validation = validateContentSet(values);
  const update = (field: keyof ContentSetValues, value: string) => setValues((current) => ({ ...current, [field]: value }));
  const addMaterial = (id: string) => { const fixture = fixtures.find((item) => item.id === id); if (fixture && !materials.some((item) => item.id === id)) setMaterials((current) => [...current, { ...fixture }]); };
  const removeMaterial = (id: string) => setMaterials((current) => current.filter((item) => item.id !== id));
  const reorderMaterial = (index: number, direction: -1 | 1) => setMaterials((current) => moveMaterial(current, index, direction));
  async function save() {
    if (!validation.isReady || demoState === "readonly" || demoState === "permission") return false;
    setSaveState("saving"); await new Promise((resolve) => setTimeout(resolve, 80));
    if ((demoState === "error" || simulateSaveError) && !hasFailedOnce.current) { hasFailedOnce.current = true; setSaveState("error"); return false; }
    try { const next = await localContentSetDataSource.saveContentSet(values, materials, draft?.id); setDraft(next); setValues({ name: next.name, description: next.description }); setMaterials(next.materials); setSaveState("saved"); return true; }
    catch { setSaveState("error"); return false; }
  }
  return { values, materials, draft, fixtures, validation, saveState, update, addMaterial, removeMaterial, reorderMaterial, save, canEdit: demoState !== "readonly" && demoState !== "permission" };
}
