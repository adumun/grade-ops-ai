package cl.gradeops.ai.api.agentclient;

import cl.gradeops.ai.agents.assessment.application.exception.AssessmentAgentException;
import cl.gradeops.ai.agents.assessment.application.port.in.GenerateAssessmentDraftUseCase;
import cl.gradeops.ai.agents.assessment.application.result.AgentExecutionLogPayload;
import cl.gradeops.ai.agents.assessment.application.result.AssessmentExecutionOutcome;
import cl.gradeops.ai.agents.assessment.application.result.AssessmentResult;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AssessmentAgentClientTest {

    private static final String CORRELATION_ID = "test-correlation-id";

    @Test
    void shouldInvokeAgentInProcessAndMapStructuredResultAndEvidence() {
        GenerateAssessmentDraftUseCase useCase = mock(GenerateAssessmentDraftUseCase.class);
        AssessmentAgentClient client = new AssessmentAgentClient(useCase);
        UUID executionId = UUID.randomUUID();
        Instant startedAt = Instant.parse("2026-11-16T18:00:00Z");
        AgentExecutionLogPayload log = AgentExecutionLogPayload.builder()
                .agentExecutionId(executionId)
                .agentName("assessment")
                .provider("groq")
                .model("llama-3.3-70b-versatile")
                .promptVersion("assessment-generation.v1")
                .inputHash("input-hash")
                .outputHash("output-hash")
                .estimatedInputTokens(120)
                .estimatedOutputTokens(340)
                .costEstimate(0.0)
                .status("COMPLETED")
                .startedAt(startedAt)
                .finishedAt(startedAt.plusSeconds(2))
                .build();
        when(useCase.execute(any())).thenReturn(new AssessmentExecutionOutcome(
                AssessmentResult.builder()
                        .title("Java Loops Assessment")
                        .context("First semester students")
                        .instructions("Implement a console program.")
                        .objectives(List.of("Use loops correctly"))
                        .deliverables(List.of("Java source file"))
                        .constraints(List.of("No external libraries"))
                        .build(),
                log));

        AssessmentAgentResponse response = client.generate(
                new AssessmentCommand("Evaluate loops", "Java loops", "basic", "90 min", "Java",
                        null, null, null, "groq", null),
                CORRELATION_ID);

        assertThat(response.result().title()).isEqualTo("Java Loops Assessment");
        assertThat(response.result().objectives()).containsExactly("Use loops correctly");
        assertThat(response.log().agentExecutionId()).isEqualTo(executionId);
        assertThat(response.log().provider()).isEqualTo("groq");
        assertThat(response.log().promptVersion()).isEqualTo("assessment-generation.v1");
        verify(useCase).execute(any());
    }

    @Test
    void shouldPreserveStructuredAgentFailureEvidence() {
        GenerateAssessmentDraftUseCase useCase = mock(GenerateAssessmentDraftUseCase.class);
        AssessmentAgentClient client = new AssessmentAgentClient(useCase);
        AgentExecutionLogPayload failureLog = AgentExecutionLogPayload.builder()
                .agentExecutionId(UUID.randomUUID())
                .agentName("assessment")
                .status("FAILED")
                .errorCode("INVALID_COMMAND")
                .startedAt(Instant.parse("2026-11-16T18:00:00Z"))
                .finishedAt(Instant.parse("2026-11-16T18:00:00Z"))
                .build();
        when(useCase.execute(any())).thenThrow(new AssessmentAgentException(
                AssessmentAgentException.Reason.INVALID_COMMAND,
                "blank learningGoal",
                failureLog));

        assertThatThrownBy(() -> client.generate(
                new AssessmentCommand(" ", "Java", "basic", "90 min", "Java",
                        null, null, null, null, null),
                CORRELATION_ID))
                .isInstanceOf(AgentClientException.class)
                .satisfies(error -> {
                    AgentClientException clientException = (AgentClientException) error;
                    assertThat(clientException.reason()).isEqualTo(AgentClientException.Reason.AGENT_REJECTED);
                    assertThat(clientException.agentError()).isNotNull();
                    assertThat(clientException.agentError().errorCode()).isEqualTo("INVALID_COMMAND");
                    assertThat(clientException.agentError().log().status()).isEqualTo("FAILED");
                });
    }
}
