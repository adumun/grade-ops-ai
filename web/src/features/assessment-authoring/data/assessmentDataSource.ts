import type { AssessmentDraft, AssessmentDraftValues } from "../domain/types";

export interface AssessmentDataSource {
  listDrafts(): Promise<AssessmentDraft[]>;
  saveDraft(values: AssessmentDraftValues, existingId?: string): Promise<AssessmentDraft>;
  reset(): Promise<void>;
}
