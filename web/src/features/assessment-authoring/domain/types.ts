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

export type MaterialType = "pdf" | "pptx" | "docx" | "image" | "link" | "text";
export type MaterialStatus = "ready" | "processing" | "error" | "unsupported";

export type Material = {
  id: string;
  name: string;
  type: MaterialType;
  status: MaterialStatus;
  sourceLabel: string;
  description?: string;
};

export type ContentSet = {
  id: string;
  name: string;
  description: string;
  materials: Material[];
  status: "draft";
  updatedAt: string;
};

export type ContentSetValues = Pick<ContentSet, "name" | "description">;
export type ContentSetDataState =
  | { status: "loading" }
  | { status: "ready"; contentSet: ContentSet }
  | { status: "error"; message: string };
export type ContentSetValidation = { errors: Partial<Record<keyof ContentSetValues, string>>; isReady: boolean };
