package cl.gradeops.ai.api.evaluation.infrastructure.adapter.out.ai;

import cl.gradeops.ai.api.evaluation.application.exception.GradingAgentPortException;
import cl.gradeops.ai.api.evaluation.application.model.GradingAgentResult;
import cl.gradeops.ai.api.evaluation.application.model.GradingContext;
import cl.gradeops.ai.api.evaluation.application.model.GradingCriterionSuggestion;
import cl.gradeops.ai.api.evaluation.application.model.GradingEvidenceReference;
import cl.gradeops.ai.api.evaluation.application.model.GradingExecutionMetadata;
import cl.gradeops.ai.api.evaluation.application.model.GradingProposal;
import cl.gradeops.ai.api.evaluation.application.port.out.GradingAgentPort;
import cl.gradeops.ai.agents.assessment.application.result.AgentExecutionLogPayload;
import cl.gradeops.ai.agents.grading.application.command.GradingCommand;
import cl.gradeops.ai.agents.grading.application.exception.GradingAgentException;
import cl.gradeops.ai.agents.grading.application.model.GradingCriterion;
import cl.gradeops.ai.agents.grading.application.model.SubmissionFile;
import cl.gradeops.ai.agents.grading.application.port.in.GradeSubmissionUseCase;
import cl.gradeops.ai.agents.grading.application.result.GradingExecutionOutcome;
import lombok.RequiredArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/** Translates the API's evaluation context into the in-process Spring AI grading contract. */
@RequiredArgsConstructor
public class SpringAiGradingAgentAdapter implements GradingAgentPort {

    private final GradeSubmissionUseCase gradeSubmissionUseCase;

    @Override
    public GradingAgentResult grade(GradingContext context) {
        Instant startedAt = Instant.now();
        int evidenceBudget = 160_000;
        int fileBudget = 120;
        List<SubmissionFile> files = new java.util.ArrayList<>();
        List<String> omittedFilePaths = new java.util.ArrayList<>();
        List<String> truncatedFilePaths = new java.util.ArrayList<>();
        for (var file : context.files()) {
            if (!"TEXT".equals(file.classification()) || file.extractedText() == null) {
                continue;
            }
            if (fileBudget <= 0) {
                omittedFilePaths.add(file.path());
            } else if (file.extractedText().length() <= evidenceBudget) {
                files.add(new SubmissionFile(file.path(), file.extractedText()));
                evidenceBudget -= file.extractedText().length();
                fileBudget--;
            } else if (evidenceBudget > 256) {
                String prefix = file.extractedText().substring(0, evidenceBudget);
                int lastCompleteLine = prefix.lastIndexOf('\\n');
                if (lastCompleteLine > 0) {
                    files.add(new SubmissionFile(file.path(), prefix.substring(0, lastCompleteLine)));
                    truncatedFilePaths.add(file.path());
                    evidenceBudget = 0;
                    fileBudget--;
                } else {
                    omittedFilePaths.add(file.path());
                }
            } else {
                omittedFilePaths.add(file.path());
            }
        }
        if (files.isEmpty()) {
            throw new GradingAgentPortException(
                    "No supported text files fit within the safe AI evidence budget",
                    null,
                    new GradingExecutionMetadata(
                            null, null, null, null, null, null, null, null,
                            "FAILED", "NO_TEXT_EVIDENCE_WITHIN_BUDGET", startedAt, Instant.now()));
        }

        List<GradingCriterion> criteria = context.criteria().stream()
                .map(criterion -> new GradingCriterion(
                        criterion.id(),
                        criterion.name(),
                        criterion.description(),
                        criterion.maxPoints(),
                        criterion.evidenceExpectations()))
                .toList();

        GradingCommand command = new GradingCommand(
                context.assessmentTitle(),
                context.assessmentContext(),
                context.assessmentInstructions(),
                context.objectives(),
                context.totalPoints(),
                criteria,
                files,
                omittedFilePaths,
                truncatedFilePaths,
                !omittedFilePaths.isEmpty() || !truncatedFilePaths.isEmpty(),
                null,
                null);

        try {
            GradingExecutionOutcome outcome = gradeSubmissionUseCase.execute(command);
            return new GradingAgentResult(
                    toProposal(outcome.result(), context),
                    toMetadata(outcome.log()));
        } catch (GradingAgentException exception) {
            throw new GradingAgentPortException(
                    exception.getMessage(),
                    exception,
                    toMetadata(exception.log()));
        } catch (RuntimeException exception) {
            throw new GradingAgentPortException(
                    "Unexpected failure while executing the grading agent",
                    exception,
                    new GradingExecutionMetadata(
                            null, null, null, null, null, null, null, null,
                            "FAILED", "UNEXPECTED_AGENT_FAILURE", startedAt, Instant.now()));
        }
    }

    private static GradingProposal toProposal(
            cl.gradeops.ai.agents.grading.application.result.GradingResult result,
            GradingContext context) {
        Map<String, cl.gradeops.ai.api.evaluation.application.model.RubricCriterion> rubric =
                context.criteria().stream().collect(Collectors.toMap(
                        cl.gradeops.ai.api.evaluation.application.model.RubricCriterion::id,
                        Function.identity()));
        List<GradingCriterionSuggestion> criteria = result.criteria().stream()
                .map(suggestion -> {
                    var criterion = rubric.get(suggestion.criterionId());
                    return new GradingCriterionSuggestion(
                            suggestion.criterionId(),
                            criterion.name(),
                            criterion.maxPoints(),
                            suggestion.suggestedPoints(),
                            suggestion.rationale(),
                            suggestion.evidence() == null ? List.of() : suggestion.evidence().stream()
                                    .map(evidence -> new GradingEvidenceReference(
                                            evidence.filePath(),
                                            evidence.lineStart(),
                                            evidence.lineEnd(),
                                            evidence.excerpt()))
                                    .toList(),
                            suggestion.uncertainty(),
                            suggestion.confidence());
                })
                .toList();
        return new GradingProposal(criteria, result.overallFeedback(), result.uncertaintySummary(), result.reviewFlags());
    }

    private static GradingExecutionMetadata toMetadata(AgentExecutionLogPayload log) {
        if (log == null) {
            Instant now = Instant.now();
            return new GradingExecutionMetadata(
                    null, null, null, null, null, null, null, null,
                    "FAILED", "MISSING_EXECUTION_LOG", now, now);
        }
        return new GradingExecutionMetadata(
                log.provider(),
                log.model(),
                log.promptVersion(),
                log.inputHash(),
                log.outputHash(),
                log.estimatedInputTokens(),
                log.estimatedOutputTokens(),
                log.costEstimate(),
                log.status(),
                log.errorCode(),
                log.startedAt(),
                log.finishedAt());
    }
}
