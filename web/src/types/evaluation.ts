export interface RubricCriterionDto {
  id: string;
  name: string;
  description: string;
  maxPoints: number;
  evidenceExpectations: string[];
}

export interface RubricViewDto {
  id: string;
  assessmentId: string;
  assessmentRevisionId: string;
  versionNumber: number;
  title: string;
  totalPoints: number;
  status: "DRAFT" | "APPROVED" | "SUPERSEDED";
  criteria: RubricCriterionDto[];
  createdBy: string;
  approvedBy: string | null;
  createdAt: string;
  approvedAt: string | null;
}

export interface CreateRubricRequestDto {
  title: string;
  totalPoints: number;
  criteria: Array<{
    id?: string;
    name: string;
    description: string;
    maxPoints: number;
    evidenceExpectations: string[];
  }>;
}

export interface SubmissionSummaryDto {
  id: string;
  learnerLabel: string;
  sourceDirectory: string;
  status: "READY" | "GRADED" | "REVIEWED" | "APPROVED";
  fileCount: number;
  textFileCount: number;
  latestGradingRunId: string | null;
}

export interface SubmissionBatchDto {
  id: string;
  assessmentId: string;
  originalFilename: string;
  status: string;
  totalFiles: number;
  totalSubmissions: number;
  submissions: SubmissionSummaryDto[];
  createdAt: string;
}

export interface SubmissionFileEvidenceDto {
  path: string;
  mediaType: string;
  sizeBytes: number;
  sha256: string;
  classification: "TEXT" | "BINARY" | "UNSUPPORTED" | "OVERSIZED";
  extractedText: string | null;
}

export interface SubmissionEvidenceDto {
  id: string;
  learnerLabel: string;
  sourceDirectory: string;
  status: string;
  files: SubmissionFileEvidenceDto[];
}

export interface GradingEvidenceReferenceDto {
  filePath: string;
  lineStart: number;
  lineEnd: number;
  excerpt: string;
}

export interface GradingCriterionSuggestionDto {
  criterionId: string;
  criterionName: string;
  maxPoints: number;
  suggestedPoints: number;
  rationale: string;
  evidence: GradingEvidenceReferenceDto[];
  uncertainty: string;
  confidence: string;
}

export interface GradingProposalDto {
  criteria: GradingCriterionSuggestionDto[];
  overallFeedback: string;
  uncertaintySummary: string;
  reviewFlags: string[];
}

export interface GradingExecutionMetadataDto {
  provider: string | null;
  model: string | null;
  promptVersion: string | null;
  inputHash: string | null;
  outputHash: string | null;
  estimatedInputTokens: number | null;
  estimatedOutputTokens: number | null;
  costEstimate: number | null;
  status: string;
  errorCode: string | null;
  startedAt: string;
  finishedAt: string | null;
}

export interface GradingReviewDto {
  id: string;
  gradingRunId: string;
  submissionId: string;
  learnerLabel: string;
  status: "DRAFT" | "APPROVED";
  proposal: GradingProposalDto;
  editedResult: GradingProposalDto;
  finalScore: number | null;
  teacherComment: string | null;
  execution: GradingExecutionMetadataDto;
  approvedBy: string | null;
  approvedAt: string | null;
}
