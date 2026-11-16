package cl.gradeops.ai.api.evaluation.application.port.out;

import cl.gradeops.ai.api.evaluation.application.command.CreateRubricDraftCommand;
import cl.gradeops.ai.api.evaluation.application.model.GradingAgentResult;
import cl.gradeops.ai.api.evaluation.application.model.GradingContext;
import cl.gradeops.ai.api.evaluation.application.model.GradingExecutionMetadata;
import cl.gradeops.ai.api.evaluation.application.model.GradingProposal;
import cl.gradeops.ai.api.evaluation.application.model.GradingReviewView;
import cl.gradeops.ai.api.evaluation.application.model.RubricView;
import cl.gradeops.ai.api.evaluation.application.model.SubmissionBatchView;
import cl.gradeops.ai.api.evaluation.application.model.SubmissionCandidate;
import cl.gradeops.ai.api.evaluation.application.model.SubmissionEvidenceView;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface EvaluationRepositoryPort {
    RubricView createRubricDraft(UUID assessmentId, String teacherUid, CreateRubricDraftCommand command);
    List<RubricView> listRubrics(UUID assessmentId, String teacherUid);
    RubricView approveRubric(UUID assessmentId, UUID rubricId, String teacherUid);

    SubmissionBatchView createSubmissionBatch(
            UUID assessmentId, String teacherUid, String filename, List<SubmissionCandidate> submissions);
    SubmissionBatchView getSubmissionBatch(UUID batchId, String teacherUid);
    SubmissionEvidenceView getSubmissionEvidence(UUID submissionId, String teacherUid);

    GradingContext getGradingContext(UUID submissionId, String teacherUid);
    UUID startGradingRun(GradingContext context, String teacherUid, Instant startedAt);
    GradingReviewView completeGradingRun(UUID gradingRunId, GradingAgentResult result, String teacherUid);
    void failGradingRun(UUID gradingRunId, GradingExecutionMetadata execution);
    GradingReviewView getGradingReview(UUID gradingRunId, String teacherUid);
    GradingReviewView updateGradingReview(
            UUID gradingRunId, String teacherUid, GradingProposal editedResult, String teacherComment);
    GradingReviewView approveGradingReview(UUID gradingRunId, String teacherUid);
    List<GradingReviewView> listApprovedReviews(UUID assessmentId, String teacherUid);
}
