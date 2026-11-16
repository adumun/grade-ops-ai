package cl.gradeops.ai.api.evaluation.application.usecase;

import cl.gradeops.ai.api.evaluation.application.command.CreateRubricDraftCommand;
import cl.gradeops.ai.api.evaluation.application.exception.GradingAgentPortException;
import cl.gradeops.ai.api.evaluation.application.exception.InvalidEvaluationRequestException;
import cl.gradeops.ai.api.evaluation.application.model.GradingExecutionMetadata;
import cl.gradeops.ai.api.evaluation.application.model.GradingProposal;
import cl.gradeops.ai.api.evaluation.application.model.GradingReviewView;
import cl.gradeops.ai.api.evaluation.application.model.RubricCriterion;
import cl.gradeops.ai.api.evaluation.application.model.SubmissionBatchView;
import cl.gradeops.ai.api.evaluation.application.model.SubmissionCandidate;
import cl.gradeops.ai.api.evaluation.application.model.GradingAgentResult;
import cl.gradeops.ai.api.evaluation.application.port.out.EvaluationRepositoryPort;
import cl.gradeops.ai.api.evaluation.application.port.out.GradingAgentPort;
import cl.gradeops.ai.api.evaluation.application.port.out.SubmissionArchiveIntakePort;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.ByteArrayInputStream;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EvaluationServiceTest {

    @Mock
    private EvaluationRepositoryPort repository;
    @Mock
    private SubmissionArchiveIntakePort archiveIntake;
    @Mock
    private GradingAgentPort gradingAgent;

    private EvaluationService service;

    @BeforeEach
    void setUp() {
        service = new EvaluationService(repository, archiveIntake, gradingAgent, 25 * 1024 * 1024);
    }

    @Test
    void rejectsRubricWhoseCriterionScoresDoNotAddUpToTotal() {
        CreateRubricDraftCommand command = new CreateRubricDraftCommand(
                "Java basics",
                new BigDecimal("100"),
                List.of(new RubricCriterion(
                        "criterion-1", "Correctness", "Correct behavior",
                        new BigDecimal("80"), List.of("Source evidence"))));

        assertThatThrownBy(() -> service.createRubricDraft(UUID.randomUUID(), "teacher-1", command))
                .isInstanceOf(InvalidEvaluationRequestException.class)
                .hasMessageContaining("add up to the rubric total");
        verify(repository, never()).createRubricDraft(any(), any(), any());
    }

    @Test
    void rejectsNonZipUploadsBeforeReadingArchive() {
        assertThatThrownBy(() -> service.uploadSubmissions(
                UUID.randomUUID(), "teacher-1", "submissions.tar", 1024, new ByteArrayInputStream(new byte[0])))
                .isInstanceOf(InvalidEvaluationRequestException.class)
                .hasMessageContaining("Only ZIP");
        verify(archiveIntake, never()).read(any());
    }

    @Test
    void persistsFailedAgentExecutionBeforePropagatingFailure() {
        UUID submissionId = UUID.randomUUID();
        UUID assessmentId = UUID.randomUUID();
        UUID rubricId = UUID.randomUUID();
        GradingExecutionMetadata failure = new GradingExecutionMetadata(
                "groq", "test-model", "grading.v1", "input", null,
                100, null, null, "FAILED", "PROVIDER_FAILURE",
                Instant.now(), Instant.now());
        when(repository.getGradingContext(submissionId, "teacher-1"))
                .thenReturn(new cl.gradeops.ai.api.evaluation.application.model.GradingContext(
                        assessmentId, submissionId, rubricId, "Assessment", "Context", "Instructions",
                        List.of(), new BigDecimal("10"), List.of(), "student-a", List.of()));
        when(repository.startGradingRun(eq(new cl.gradeops.ai.api.evaluation.application.model.GradingContext(
                assessmentId, submissionId, rubricId, "Assessment", "Context", "Instructions",
                List.of(), new BigDecimal("10"), List.of(), "student-a", List.of())),
                eq("teacher-1"), any())).thenReturn(UUID.randomUUID());
        when(gradingAgent.grade(any())).thenThrow(new GradingAgentPortException(
                "provider unavailable", new RuntimeException("timeout"), failure));

        assertThatThrownBy(() -> service.gradeSubmission(submissionId, "teacher-1"))
                .isInstanceOf(GradingAgentPortException.class);
        verify(repository).failGradingRun(any(), eq(failure));
    }

    @Test
    void returnsPersistedReviewAfterSuccessfulAgentRun() {
        UUID submissionId = UUID.randomUUID();
        UUID assessmentId = UUID.randomUUID();
        UUID rubricId = UUID.randomUUID();
        UUID runId = UUID.randomUUID();
        var context = new cl.gradeops.ai.api.evaluation.application.model.GradingContext(
                assessmentId, submissionId, rubricId, "Assessment", "Context", "Instructions",
                List.of(), new BigDecimal("10"), List.of(), "student-a", List.of());
        GradingAgentResult result = new GradingAgentResult(
                new GradingProposal(List.of(), "Feedback", "Source-only", List.of()),
                new GradingExecutionMetadata(
                        "groq", "test-model", "grading.v1", "input", "output",
                        100, 200, 0.0, "COMPLETED", null, Instant.now(), Instant.now()));
        GradingReviewView review = new GradingReviewView(
                UUID.randomUUID(), runId, submissionId, "student-a", "DRAFT",
                result.proposal(), result.proposal(), null, null, result.execution(), null, null);
        when(repository.getGradingContext(submissionId, "teacher-1")).thenReturn(context);
        when(repository.startGradingRun(eq(context), eq("teacher-1"), any())).thenReturn(runId);
        when(gradingAgent.grade(context)).thenReturn(result);
        when(repository.completeGradingRun(runId, result, "teacher-1")).thenReturn(review);

        assertThat(service.gradeSubmission(submissionId, "teacher-1")).isEqualTo(review);
        verify(repository, never()).failGradingRun(any(), any());
    }
}
