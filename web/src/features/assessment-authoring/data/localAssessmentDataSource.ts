import type { AssessmentDataSource } from "./assessmentDataSource";
import type { AssessmentDraft } from "../domain/types";

export const ASSESSMENT_DRAFT_STORAGE_KEY = "gradeops.local-preview.assessment-drafts";
export const LOCAL_DRAFT_ID = "assessment-draft-local-001";
const LOCAL_UPDATED_AT = "2026-10-11T00:00:00.000Z";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function readStoredDrafts(): AssessmentDraft[] {
  if (!canUseStorage()) return [];
  const raw = window.localStorage.getItem(ASSESSMENT_DRAFT_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as AssessmentDraft[]).filter((draft) => draft.status === "draft") : [];
  } catch {
    return [];
  }
}

export const localAssessmentDataSource: AssessmentDataSource = {
  async listDrafts() {
    return readStoredDrafts();
  },

  async saveDraft(values, existingId = LOCAL_DRAFT_ID) {
    const draft: AssessmentDraft = {
      id: existingId,
      title: values.title.trim(),
      topic: values.topic.trim(),
      purpose: values.purpose.trim(),
      status: "draft",
      updatedAt: LOCAL_UPDATED_AT,
    };
    if (canUseStorage()) window.localStorage.setItem(ASSESSMENT_DRAFT_STORAGE_KEY, JSON.stringify([draft]));
    return draft;
  },

  async reset() {
    if (canUseStorage()) window.localStorage.removeItem(ASSESSMENT_DRAFT_STORAGE_KEY);
  },
};
