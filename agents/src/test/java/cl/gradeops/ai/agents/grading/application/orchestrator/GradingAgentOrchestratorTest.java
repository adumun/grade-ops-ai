package cl.gradeops.ai.agents.grading.application.orchestrator;

import cl.gradeops.ai.agents.grading.application.command.GradingCommand;
import cl.gradeops.ai.agents.grading.application.exception.GradingAgentException;
import cl.gradeops.ai.agents.grading.application.model.GradingCriterion;
import cl.gradeops.ai.agents.grading.application.model.SubmissionFile;
import cl.gradeops.ai.agents.grading.application.result.GradingResult;
import cl.gradeops.ai.agents.shared.application.port.out.StructuredGenerationPort;
import cl.gradeops.ai.agents.shared.application.port.out.StructuredGenerationPortSelector;
import cl.gradeops.ai.agents.shared.application.port.out.StructuredGenerationResponse;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.json.JsonMapper;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class GradingAgentOrchestratorTest {

    private static final GradingCommand COMMAND = new GradingCommand(
            "Loops assessment",
            "Introductory Java course",
            "Implement a loop that accumulates values.",
            List.of("Use loops and variables"),
            new BigDecimal("10"),
            List.of(new GradingCriterion(
                    "criterion-1", "Loop correctness", "Uses a loop and accumulates correctly",
                    new BigDecimal("10"), List.of("Loop statement", "Accumulator update"))),
            List.of(new SubmissionFile("src/Main.java", "int total = 0;\nfor (int i = 0; i < 5; i++) total += i;\n")),
            "groq",
            null);

    @Test
    void returnsEvidenceBackedCriterionProposalAndExecutionLog() {
        GradingResult result = new GradingResult(
                List.of(new GradingResult.CriterionSuggestion(
                        "criterion-1",
                        new BigDecimal("9"),
                        "The loop accumulates values correctly.",
                        List.of(new GradingResult.EvidenceReference(
                                "src/Main.java", 1, 2, "int total = 0;")),
                        "No runtime execution was performed.",
                        "HIGH")),
                "Good implementation with a small improvement opportunity.",
                "Behavior was assessed from source evidence only.",
                List.of());

        GradingAgentOrchestrator orchestrator = orchestrator(result);
        orchestrator.loadTemplate();

        var outcome = orchestrator.grade(COMMAND);

        assertThat(outcome.result().criteria()).hasSize(1);
        assertThat(outcome.result().criteria().getFirst().suggestedPoints()).isEqualByComparingTo("9");
        assertThat(outcome.log().agentName()).isEqualTo("grading");
        assertThat(outcome.log().provider()).isEqualTo("groq");
        assertThat(outcome.log().promptVersion()).isEqualTo("grading.v1");
        assertThat(outcome.log().inputHash()).hasSize(64);
    }

    @Test
    void surfacesWhenEvidenceWasTruncatedToFitTheModelBudget() {
        GradingResult result = new GradingResult(
                List.of(new GradingResult.CriterionSuggestion(
                        "criterion-1",
                        new BigDecimal("8"),
                        "The available source evidence demonstrates the loop.",
                        List.of(new GradingResult.EvidenceReference(
                                "src/Main.java", 1, 1, "int total = 0;")),
                        "Other source files were omitted from this run.",
                        "MEDIUM")),
                "Review the complete project before finalizing.",
                "Only a bounded subset of source files was inspected.",
                List.of());
        GradingCommand truncatedCommand = new GradingCommand(
                COMMAND.assessmentTitle(),
                COMMAND.context(),
                COMMAND.instructions(),
                COMMAND.objectives(),
                COMMAND.totalPoints(),
                COMMAND.criteria(),
                COMMAND.files(),
                List.of("src/Additional.java"),
                List.of(),
                true,
                COMMAND.provider(),
                COMMAND.model());

        GradingAgentOrchestrator orchestrator = orchestrator(result);
        orchestrator.loadTemplate();

        var outcome = orchestrator.grade(truncatedCommand);

        assertThat(outcome.result().reviewFlags()).contains("EVIDENCE_TRUNCATED");
        assertThat(outcome.result().uncertaintySummary()).contains("omitted");
    }

    @Test
    void rejectsEvidenceThatDoesNotExistInSubmittedFiles() {
        GradingResult result = new GradingResult(
                List.of(new GradingResult.CriterionSuggestion(
                        "criterion-1", new BigDecimal("8"), "Looks correct.",
                        List.of(new GradingResult.EvidenceReference(
                                "src/Other.java", 1, 1, "return true;")),
                        "No execution performed.", "MEDIUM")),
                "Feedback", "Source-only assessment.", List.of());

        GradingAgentOrchestrator orchestrator = orchestrator(result);
        orchestrator.loadTemplate();

        assertThatThrownBy(() -> orchestrator.grade(COMMAND))
                .isInstanceOf(GradingAgentException.class)
                .satisfies(error -> assertThat(((GradingAgentException) error).reason())
                        .isEqualTo(GradingAgentException.Reason.MALFORMED_OUTPUT));
    }

    @Test
    void rejectsScoresOutsideCriterionMaximum() {
        GradingResult result = new GradingResult(
                List.of(new GradingResult.CriterionSuggestion(
                        "criterion-1", new BigDecimal("11"), "Over maximum.",
                        List.of(new GradingResult.EvidenceReference(
                                "src/Main.java", 1, 1, "int total = 0;")),
                        "No execution performed.", "LOW")),
                "Feedback", "Source-only assessment.", List.of());

        GradingAgentOrchestrator orchestrator = orchestrator(result);
        orchestrator.loadTemplate();

        assertThatThrownBy(() -> orchestrator.grade(COMMAND))
                .isInstanceOf(GradingAgentException.class)
                .satisfies(error -> assertThat(((GradingAgentException) error).reason())
                        .isEqualTo(GradingAgentException.Reason.MALFORMED_OUTPUT));
    }

    private static GradingAgentOrchestrator orchestrator(GradingResult result) {
        StructuredGenerationPort fakeProvider = new StructuredGenerationPort() {
            @Override
            @SuppressWarnings("unchecked")
            public <T> StructuredGenerationResponse<T> generate(String prompt, String model, Class<T> type) {
                return new StructuredGenerationResponse<>(
                        (T) result, "{structured}", "test-model", 100, 200);
            }
        };
        return new GradingAgentOrchestrator(
                new StructuredGenerationPortSelector(Map.of("groq", fakeProvider), "groq"),
                Map.of("groq", 0.0),
                JsonMapper.builder().build());
    }
}
