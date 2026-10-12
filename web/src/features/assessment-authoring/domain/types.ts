export type AssessmentDraft = {
  id: string;
  title: string;
  topic: string;
  purpose: string;
  status: "draft";
  updatedAt: string;
};

export type AssessmentAccess = "editable" | "read-only" | "permission-denied";

export type AssessmentDataState =
  | { status: "loading" }
  | { status: "ready"; drafts: AssessmentDraft[] }
  | { status: "error"; message: string };

export type AssessmentDraftValues = Pick<AssessmentDraft, "title" | "topic" | "purpose">;

export type AssessmentValidation = {
  errors: Partial<Record<keyof AssessmentDraftValues, string>>;
  warnings: string[];
  isReady: boolean;
};
