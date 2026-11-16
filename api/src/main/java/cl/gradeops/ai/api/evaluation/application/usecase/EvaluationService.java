package cl.gradeops.ai.api.evaluation.application.usecase;

import cl.gradeops.ai.api.evaluation.application.command.CreateRubricDraftCommand;
import cl.gradeops.ai.api.evaluation.application.exception.EvaluationConflictException;
import cl.gradeops.ai.api.evaluation.application.exception.InvalidEvaluationRequestException;
import cl.gradeops.ai.api.evaluation.application.exception.GradingAgentPortException;
import cl.gradeops.ai.api.evaluation.application.model.GradingExecutionMetadata;
import cl.gradeops.ai.api.evaluation.application.model.GradingProposal;
import cl.gradeops.ai.api.evaluation.application.model.GradingReviewView;
import cl.gradeops.ai.api.evaluation.application.port.out.GradingAgentPort;
import cl.gradeops.ai.api.evaluation.application.model.GradingContext;
import cl.gradeops.ai.api.evaluation.application.model.RubricCriterion;
import cl.gradeops.ai.api.evaluation.application.model.RubricView;
import cl.gradeops.ai.api.evaluation.application.model.SubmissionBatchView;
import cl.gradeops.ai.api.evaluation.application.model.SubmissionCandidate;
import cl.gradeops.ai.api.evaluation.application.model.SubmissionEvidenceView;
import cl.gradeops.ai.api.evaluation.application.port.out.EvaluationRepositoryPort;
import cl.gradeops.ai.api.evaluation.application.port.out.SubmissionArchiveIntakePort;

import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/** Coordinates teacher-facing rubric and submission-intake use cases. */
public class EvaluationService {

    private final EvaluationRepositoryPort repository;
    private final SubmissionArchiveIntakePort archiveIntake;
    private final long maxArchiveBytes;
    private final GradingAgentPort gradingAgent;

    public EvaluationService(
            EvaluationRepositoryPort repository,
            SubmissionArchiveIntakePort archiveIntake,
            GradingAgentPort gradingAgent,
            long maxArchiveBytes) {
        this.repository = repository;
        this.archiveIntake = archiveIntake;
        this.gradingAgent = gradingAgent;
        this.maxArchiveBytes = maxArchiveBytes;
    }

    public RubricView createRubricDraft(UUID assessmentId, String teacherUid, CreateRubricDraftCommand command) {
        validateRubric(command);
        return repository.createRubricDraft(assessmentId, teacherUid, command);
    }

    public List<RubricView> listRubrics(UUID assessmentId, String teacherUid) {
        return repository.listRubrics(assessmentId, teacherUid);
    }

    public RubricView updateRubricDraft(
            UUID assessmentId, UUID rubricId, String teacherUid, CreateRubricDraftCommand command) {
        validateRubric(command);
        return repository.updateRubricDraft(assessmentId, rubricId, teacherUid, command);
    }

    public RubricView approveRubric(UUID assessmentId, UUID rubricId, String teacherUid) {
        return repository.approveRubric(assessmentId, rubricId, teacherUid);
    }

    public SubmissionBatchView uploadSubmissions(
            UUID assessmentId, String teacherUid, String filename, long archiveSize, InputStream archive) {
        if (filename == null || !filename.toLowerCase().endsWith(".zip")) {
            throw new InvalidEvaluationRequestException("Only ZIP archives are supported");
        }
        if (archiveSize <= 0 || archiveSize > maxArchiveBytes) {
            throw new InvalidEvaluationRequestException("ZIP archive exceeds the allowed upload size");
        }

        List<SubmissionCandidate> submissions;
        try {
            submissions = archiveIntake.read(archive);
        } catch (IllegalArgumentException exception) {
            throw new InvalidEvaluationRequestException(exception.getMessage(), exception);
        }

        String safeFilename = filename.replace('\\', '/');
        safeFilename = safeFilename.substring(safeFilename.lastIndexOf('/') + 1);
        if (safeFilename.isBlank()) {
            safeFilename = "submissions.zip";
        }
        return repository.createSubmissionBatch(assessmentId, teacherUid, safeFilename, submissions);
    }

    public SubmissionBatchView getSubmissionBatch(UUID batchId, String teacherUid) {
        return repository.getSubmissionBatch(batchId, teacherUid);
    }

    public List<SubmissionBatchView> listSubmissionBatches(UUID assessmentId, String teacherUid) {
        return repository.listSubmissionBatches(assessmentId, teacherUid);
    }

    public SubmissionEvidenceView getSubmissionEvidence(UUID submissionId, String teacherUid) {
        return repository.getSubmissionEvidence(submissionId, teacherUid);
    }

    public GradingReviewView gradeSubmission(UUID submissionId, String teacherUid) {
        GradingContext context = repository.getGradingContext(submissionId, teacherUid);
        Instant startedAt = Instant.now();
        UUID gradingRunId = repository.startGradingRun(context, teacherUid, startedAt);
        try {
            var result = gradingAgent.grade(context);
            return repository.completeGradingRun(gradingRunId, result, teacherUid);
        } catch (GradingAgentPortException exception) {
            repository.failGradingRun(gradingRunId, exception.execution());
            throw exception;
        } catch (RuntimeException exception) {
            repository.failGradingRun(gradingRunId, new GradingExecutionMetadata(
                    null, null, null, null, null, null, null, null,
                    "FAILED", "UNEXPECTED_EVALUATION_FAILURE", startedAt, Instant.now()));
            throw exception;
        }
    }

    public GradingReviewView getGradingReview(UUID gradingRunId, String teacherUid) {
        return repository.getGradingReview(gradingRunId, teacherUid);
    }

    public GradingReviewView getLatestGradingReview(UUID submissionId, String teacherUid) {
        return repository.getLatestGradingReview(submissionId, teacherUid);
    }

    public GradingReviewView updateGradingReview(
            UUID gradingRunId, String teacherUid, GradingProposal editedResult, String teacherComment) {
        return repository.updateGradingReview(gradingRunId, teacherUid, editedResult, teacherComment);
    }

    public GradingReviewView approveGradingReview(UUID gradingRunId, String teacherUid) {
        return repository.approveGradingReview(gradingRunId, teacherUid);
    }

    public List<GradingReviewView> listApprovedReviews(UUID assessmentId, String teacherUid) {
        return repository.listApprovedReviews(assessmentId, teacherUid);
    }

    public byte[] exportApprovedResultsCsv(UUID assessmentId, String teacherUid) {
        List<GradingReviewView> reviews = repository.listApprovedReviews(assessmentId, teacherUid);
        StringBuilder csv = new StringBuilder().append((char) 0xFEFF);
        csv.append("learner_label,submission_id,criterion_name,max_points,final_points,rationale,evidence,uncertainty,confidence,overall_feedback,teacher_comment,approved_by,approved_at,provider,model,prompt_version\r\n");
        for (GradingReviewView review : reviews) {
            if (review.editedResult() == null || review.editedResult().criteria() == null) {
                continue;
            }
            for (var criterion : review.editedResult().criteria()) {
                String evidence = criterion.evidence() == null ? "" : criterion.evidence().stream()
                        .map(item -> item.filePath() + ":" + item.lineStart() + "-" + item.lineEnd()
                                + " [" + item.excerpt() + "]")
                        .collect(java.util.stream.Collectors.joining(" | "));
                var execution = review.execution();
                csv.append(csv(review.learnerLabel())).append(',')
                        .append(csv(review.submissionId().toString())).append(',')
                        .append(csv(criterion.criterionName())).append(',')
                        .append(csv(criterion.maxPoints().toPlainString())).append(',')
                        .append(csv(criterion.suggestedPoints().toPlainString())).append(',')
                        .append(csv(criterion.rationale())).append(',')
                        .append(csv(evidence)).append(',')
                        .append(csv(criterion.uncertainty())).append(',')
                        .append(csv(criterion.confidence())).append(',')
                        .append(csv(review.editedResult().overallFeedback())).append(',')
                        .append(csv(review.teacherComment())).append(',')
                        .append(csv(review.approvedBy())).append(',')
                        .append(csv(review.approvedAt() == null ? "" : review.approvedAt().toString())).append(',')
                        .append(csv(execution == null ? "" : execution.provider())).append(',')
                        .append(csv(execution == null ? "" : execution.model())).append(',')
                        .append(csv(execution == null ? "" : execution.promptVersion()))
                        .append("\r\n");
            }
        }
        return csv.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
    }

    private static String csv(String value) {
        if (value == null) {
            return "\"\"";
        }
        return "\"" + value.replace("\"", "\"\"") + "\"";
    }

    private static void validateRubric(CreateRubricDraftCommand command) {
        if (command == null || command.title() == null || command.title().isBlank()) {
            throw new InvalidEvaluationRequestException("Rubric title is required");
        }
        if (command.totalPoints() == null || command.totalPoints().compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidEvaluationRequestException("Rubric total points must be greater than zero");
        }
        if (command.criteria() == null || command.criteria().isEmpty() || command.criteria().size() > 20) {
            throw new InvalidEvaluationRequestException("A rubric must contain between 1 and 20 criteria");
        }

        Set<String> ids = new HashSet<>();
        BigDecimal sum = BigDecimal.ZERO;
        for (RubricCriterion criterion : command.criteria()) {
            if (criterion == null || criterion.id() == null || criterion.id().isBlank()
                    || criterion.name() == null || criterion.name().isBlank()
                    || criterion.description() == null || criterion.description().isBlank()
                    || criterion.maxPoints() == null
                    || criterion.maxPoints().compareTo(BigDecimal.ZERO) <= 0) {
                throw new InvalidEvaluationRequestException("Every rubric criterion needs a name, description and positive score");
            }
            if (!ids.add(criterion.id())) {
                throw new InvalidEvaluationRequestException("Rubric criterion identifiers must be unique");
            }
            sum = sum.add(criterion.maxPoints());
        }
        if (sum.compareTo(command.totalPoints()) != 0) {
            throw new InvalidEvaluationRequestException("Criterion maximum scores must add up to the rubric total");
        }
    }
}
