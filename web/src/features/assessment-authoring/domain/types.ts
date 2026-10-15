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
  | { status: "ready"; contentSet: ContentSet; reusableContentSets: ContentSet[]; associatedContentSetIds: string[] }
  | { status: "error"; message: string };
export type ContentSetValidation = { errors: Partial<Record<keyof ContentSetValues, string>>; isReady: boolean };

/** Local preview model; this is not a backend contract. */
export type ObjectiveStatus = "draft" | "ready" | "needs_review";
export type ObjectiveSource = "manual" | "demo-ai";
export type ObjectiveAiDecision = "pending" | "accepted" | "edited" | "rejected";

export type Objective = {
  id: string;
  title: string;
  description: string;
  observableEvidence: string;
  materialIds: string[];
  status: ObjectiveStatus;
  source: ObjectiveSource;
  aiDecision?: ObjectiveAiDecision;
};

export type ObjectiveSet = {
  id: string;
  assessmentDraftId: string;
  objectives: Objective[];
  updatedAt: string;
};

export type ObjectiveValues = Pick<Objective, "title" | "description" | "observableEvidence" | "materialIds">;
export type ObjectiveValidation = {
  errors: Partial<Record<Exclude<keyof ObjectiveValues, "materialIds">, string>>;
  warnings: string[];
  isReady: boolean;
};
export type ObjectiveCoverage = {
  total: number;
  ready: number;
  withoutEvidence: number;
  withoutMaterials: number;
  coveredMaterialIds: string[];
  contentCoveragePercent: number;
  warnings: string[];
};
export type ObjectiveSetDataState =
  | { status: "loading" }
  | { status: "ready"; objectiveSet: ObjectiveSet }
  | { status: "error"; message: string };

/** Local-preview rubric model. It deliberately is not an API contract. */
export type RubricAiDecision = "pending" | "accepted" | "edited" | "rejected";

export type RubricLevel = {
  id: string;
  label: string;
  descriptor: string;
  score: number;
};

export type RubricCriterion = {
  id: string;
  title: string;
  description: string;
  weight: number;
  objectiveIds: string[];
  levels: RubricLevel[];
};

export type RubricVersion = {
  id: string;
  title: string;
  version: number;
  criteria: RubricCriterion[];
  aiDecision?: RubricAiDecision;
  updatedAt: string;
  isDemo?: boolean;
};

export type RubricDataState =
  | { status: "loading" }
  | { status: "ready"; rubric: RubricVersion; availableRubrics: RubricVersion[] }
  | { status: "error"; message: string };

export type RubricCriterionValidation = {
  errors: string[];
  warnings: string[];
  isValid: boolean;
};

export type RubricReadiness = {
  isReady: boolean;
  weightTotal: number;
  weightState: "incomplete" | "correct" | "exceeded";
  objectivesWithoutCriterion: string[];
  duplicateCriteria: string[];
  warnings: string[];
  blockers: string[];
};
