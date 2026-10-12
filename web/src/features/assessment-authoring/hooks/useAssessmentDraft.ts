"use client";

import { useEffect, useRef, useState } from "react";
import { useDemoState } from "@/components/shell/ShellContext";
import { localAssessmentDataSource } from "../data/localAssessmentDataSource";
import { assessAssessmentReadiness } from "../domain/assessmentReadiness";
import type { AssessmentDraft, AssessmentDraftValues } from "../domain/types";

type SaveState = "idle" | "saving" | "saved" | "error";

export function useAssessmentDraft(initialDraft?: AssessmentDraft, simulateSaveError = false) {
  const { demoState } = useDemoState();
  const [values, setValues] = useState<AssessmentDraftValues>({
    title: initialDraft?.title ?? "",
    topic: initialDraft?.topic ?? "",
    purpose: initialDraft?.purpose ?? "",
  });
  const [draft, setDraft] = useState(initialDraft);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const hasFailedOnce = useRef(false);

  useEffect(() => {
    if (!initialDraft || draft?.id === initialDraft.id) return;
    setDraft(initialDraft);
    setValues({ title: initialDraft.title, topic: initialDraft.topic, purpose: initialDraft.purpose });
  }, [draft?.id, initialDraft]);

  const validation = assessAssessmentReadiness(values);
  const update = (field: keyof AssessmentDraftValues, value: string) => setValues((current) => ({ ...current, [field]: value }));

  async function save() {
    if (!validation.isReady || demoState === "readonly" || demoState === "permission") return false;
    setSaveState("saving");
    await new Promise((resolve) => setTimeout(resolve, 80));
    if ((demoState === "error" || simulateSaveError) && !hasFailedOnce.current) {
      hasFailedOnce.current = true;
      setSaveState("error");
      return false;
    }
    try {
      const nextDraft = await localAssessmentDataSource.saveDraft(values, draft?.id);
      setDraft(nextDraft);
      setValues({ title: nextDraft.title, topic: nextDraft.topic, purpose: nextDraft.purpose });
      setSaveState("saved");
      return true;
    } catch {
      setSaveState("error");
      return false;
    }
  }

  return { values, draft, validation, saveState, update, save, canEdit: demoState !== "readonly" && demoState !== "permission" };
}
