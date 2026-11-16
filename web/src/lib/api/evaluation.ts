import { apiClient } from "@/lib/api/client";
import type {
  CreateRubricRequestDto,
  GradingProposalDto,
  GradingReviewDto,
  RubricViewDto,
  SubmissionBatchDto,
  SubmissionEvidenceDto,
} from "@/types/evaluation";

export class EvaluationApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
    action: string,
  ) {
    const detail = body && typeof body === "object" && "message" in body
      ? String((body as { message?: unknown }).message ?? "")
      : "";
    super(detail || `${action} failed with status ${status}`);
    this.name = "EvaluationApiError";
  }
}

async function ensureOk<T>(response: Response, action: string): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: "UNKNOWN", message: null }));
    throw new EvaluationApiError(response.status, body, action);
  }
  return response.json() as Promise<T>;
}

export async function listRubrics(assessmentId: string): Promise<RubricViewDto[]> {
  return ensureOk(await apiClient(`/api/v1/assessments/${assessmentId}/rubrics`), "listRubrics");
}

export async function createRubric(
  assessmentId: string,
  request: CreateRubricRequestDto,
): Promise<RubricViewDto> {
  return ensureOk(await apiClient(`/api/v1/assessments/${assessmentId}/rubrics`, {
    method: "POST",
    body: JSON.stringify(request),
  }), "createRubric");
}

export async function updateRubric(
  assessmentId: string,
  rubricId: string,
  request: CreateRubricRequestDto,
): Promise<RubricViewDto> {
  return ensureOk(await apiClient(`/api/v1/assessments/${assessmentId}/rubrics/${rubricId}`, {
    method: "PUT",
    body: JSON.stringify(request),
  }), "updateRubric");
}

export async function approveRubric(assessmentId: string, rubricId: string): Promise<RubricViewDto> {
  return ensureOk(await apiClient(`/api/v1/assessments/${assessmentId}/rubrics/${rubricId}/approve`, {
    method: "POST",
  }), "approveRubric");
}

export async function listSubmissionBatches(assessmentId: string): Promise<SubmissionBatchDto[]> {
  return ensureOk(await apiClient(`/api/v1/assessments/${assessmentId}/submission-batches`), "listSubmissionBatches");
}

export async function uploadSubmissions(assessmentId: string, file: File): Promise<SubmissionBatchDto> {
  const form = new FormData();
  form.append("file", file);
  return ensureOk(await apiClient(`/api/v1/assessments/${assessmentId}/submission-batches`, {
    method: "POST",
    body: form,
  }), "uploadSubmissions");
}

export async function getSubmissionBatch(batchId: string): Promise<SubmissionBatchDto> {
  return ensureOk(await apiClient(`/api/v1/submission-batches/${batchId}`), "getSubmissionBatch");
}

export async function getSubmissionEvidence(submissionId: string): Promise<SubmissionEvidenceDto> {
  return ensureOk(await apiClient(`/api/v1/submissions/${submissionId}/evidence`), "getSubmissionEvidence");
}

export async function getLatestGradingReview(submissionId: string): Promise<GradingReviewDto | null> {
  const response = await apiClient(`/api/v1/submissions/${submissionId}/latest-review`);
  if (response.status === 204) return null;
  return ensureOk(response, "getLatestGradingReview");
}

export async function runGrading(submissionId: string): Promise<GradingReviewDto> {
  return ensureOk(await apiClient(`/api/v1/submissions/${submissionId}/grading-runs`, {
    method: "POST",
  }), "runGrading");
}

export async function getGradingReview(gradingRunId: string): Promise<GradingReviewDto> {
  return ensureOk(await apiClient(`/api/v1/grading-runs/${gradingRunId}/review`), "getGradingReview");
}

export async function updateGradingReview(
  gradingRunId: string,
  editedResult: GradingProposalDto,
  teacherComment: string,
): Promise<GradingReviewDto> {
  return ensureOk(await apiClient(`/api/v1/grading-runs/${gradingRunId}/review`, {
    method: "PUT",
    body: JSON.stringify({ editedResult, teacherComment }),
  }), "updateGradingReview");
}

export async function approveGradingReview(gradingRunId: string): Promise<GradingReviewDto> {
  return ensureOk(await apiClient(`/api/v1/grading-runs/${gradingRunId}/approve`, {
    method: "POST",
  }), "approveGradingReview");
}

export async function exportApprovedResults(assessmentId: string): Promise<Blob> {
  const response = await apiClient(`/api/v1/assessments/${assessmentId}/approved-results/export`);
  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: "UNKNOWN", message: null }));
    throw new EvaluationApiError(response.status, body, "exportApprovedResults");
  }
  return response.blob();
}
