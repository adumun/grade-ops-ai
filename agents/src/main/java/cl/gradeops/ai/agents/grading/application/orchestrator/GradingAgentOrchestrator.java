package cl.gradeops.ai.agents.grading.application.orchestrator;

import cl.gradeops.ai.agents.assessment.application.result.AgentExecutionLogPayload;
import cl.gradeops.ai.agents.grading.application.command.GradingCommand;
import cl.gradeops.ai.agents.grading.application.exception.GradingAgentException;
import cl.gradeops.ai.agents.grading.application.exception.GradingAgentException.Reason;
import cl.gradeops.ai.agents.grading.application.model.GradingCriterion;
import cl.gradeops.ai.agents.grading.application.model.SubmissionFile;
import cl.gradeops.ai.agents.grading.application.result.GradingExecutionOutcome;
import cl.gradeops.ai.agents.grading.application.result.GradingResult;
import cl.gradeops.ai.agents.shared.application.port.out.StructuredGenerationPortSelector;
import cl.gradeops.ai.agents.shared.application.port.out.StructuredGenerationPortSelector.SelectedProvider;
import cl.gradeops.ai.agents.shared.application.port.out.StructuredGenerationResponse;
import jakarta.annotation.PostConstruct;
import org.stringtemplate.v4.ST;
import tools.jackson.databind.json.JsonMapper;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * Produces evidence-backed criterion proposals. It never executes learner code and never
 * produces an official grade; the teacher review workflow owns all final decisions.
 */
public class GradingAgentOrchestrator {

    private static final String TEMPLATE_RESOURCE = "prompts/code-grading.st";
    private static final String AGENT_NAME = "grading";
    private static final int MAX_CRITERIA = 20;
    private static final int MAX_FILES = 120;
    private static final int MAX_EVIDENCE_CHARACTERS = 80_000;

    private final StructuredGenerationPortSelector selector;
    private final Map<String, Double> costPerKTokensByProvider;
    private final JsonMapper jsonMapper;

    private String templateBody;
    private String promptVersion;

    public GradingAgentOrchestrator(
            StructuredGenerationPortSelector selector,
            Map<String, Double> costPerKTokensByProvider,
            JsonMapper jsonMapper) {
        this.selector = selector;
        this.costPerKTokensByProvider = Map.copyOf(costPerKTokensByProvider);
        this.jsonMapper = jsonMapper;
    }

    @PostConstruct
    void loadTemplate() {
        String raw;
        try (InputStream in = getClass().getClassLoader().getResourceAsStream(TEMPLATE_RESOURCE)) {
            if (in == null) {
                throw new IllegalStateException("Prompt template resource not found: " + TEMPLATE_RESOURCE);
            }
            raw = new String(in.readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException exception) {
            throw new IllegalStateException("Failed to load prompt template: " + TEMPLATE_RESOURCE, exception);
        }
        int firstNewline = raw.indexOf('\n');
        if (firstNewline < 1) {
            throw new IllegalStateException("Prompt template must start with a version line");
        }
        promptVersion = raw.substring(0, firstNewline).strip();
        templateBody = raw.substring(firstNewline + 1);
    }

    public GradingExecutionOutcome grade(GradingCommand command) {
        Instant startedAt = Instant.now();
        validateCommand(command, startedAt);

        SelectedProvider selected;
        try {
            selected = selector.resolve(command.provider());
        } catch (RuntimeException exception) {
            throw failure(Reason.INVALID_COMMAND, "Requested AI provider is not configured", exception,
                    null, null, null, startedAt);
        }

        String renderedPrompt = buildPrompt(command);
        String inputHash = sha256Hex(renderedPrompt);
        StructuredGenerationResponse<GradingResult> response;
        try {
            response = selected.port().generate(renderedPrompt, command.model(), GradingResult.class);
        } catch (RuntimeException exception) {
            throw failure(Reason.PROVIDER_FAILURE, "Grading provider call failed", exception,
                    selected.name(), inputHash, null, startedAt);
        }

        GradingResult result;
        try {
            result = validateOutput(response == null ? null : response.result(), command);
        } catch (RuntimeException exception) {
            throw failure(Reason.MALFORMED_OUTPUT, "Grading agent returned invalid or unverifiable evidence",
                    exception, selected.name(), inputHash, response, startedAt);
        }

        String outputHash = sha256Hex(response.rawResponseText() == null ? "" : response.rawResponseText());
        AgentExecutionLogPayload log = AgentExecutionLogPayload.builder()
                .agentExecutionId(UUID.randomUUID())
                .agentName(AGENT_NAME)
                .provider(selected.name())
                .model(response.modelName())
                .promptVersion(promptVersion)
                .inputHash(inputHash)
                .outputHash(outputHash)
                .estimatedInputTokens(response.estimatedInputTokens())
                .estimatedOutputTokens(response.estimatedOutputTokens())
                .costEstimate(estimateCost(selected.name(), response.estimatedInputTokens(), response.estimatedOutputTokens()))
                .status("COMPLETED")
                .startedAt(startedAt)
                .finishedAt(Instant.now())
                .build();

        return new GradingExecutionOutcome(result, log);
    }

    private void validateCommand(GradingCommand command, Instant startedAt) {
        if (command == null
                || isBlank(command.assessmentTitle())
                || isBlank(command.instructions())
                || command.totalPoints() == null
                || command.criteria() == null
                || command.criteria().isEmpty()
                || command.criteria().size() > MAX_CRITERIA
                || command.files() == null
                || command.files().isEmpty()
                || command.files().size() > MAX_FILES
                || !selector.supports(command.provider())) {
            throw failure(Reason.INVALID_COMMAND, "GradingCommand is incomplete or exceeds safe limits",
                    null, null, null, null, startedAt);
        }

        Set<String> criterionIds = new HashSet<>();
        for (GradingCriterion criterion : command.criteria()) {
            if (criterion == null || isBlank(criterion.id()) || isBlank(criterion.name())
                    || criterion.maxPoints() == null || criterion.maxPoints().signum() <= 0
                    || !criterionIds.add(criterion.id())) {
                throw failure(Reason.INVALID_COMMAND, "Rubric criteria are invalid", null,
                        null, null, null, startedAt);
            }
        }

        int evidenceCharacters = 0;
        for (SubmissionFile file : command.files()) {
            if (file == null || isBlank(file.path()) || file.content() == null) {
                throw failure(Reason.INVALID_COMMAND, "Submission evidence is invalid", null,
                        null, null, null, startedAt);
            }
            evidenceCharacters += file.content().length();
            if (evidenceCharacters > MAX_EVIDENCE_CHARACTERS) {
                throw failure(Reason.INVALID_COMMAND, "Prepared evidence exceeds the model context limit",
                        null, null, null, null, startedAt);
            }
        }
    }

    private String buildPrompt(GradingCommand command) {
        try {
            ST template = new ST(templateBody);
            template.add("assessmentTitle", command.assessmentTitle());
            template.add("context", command.context() == null ? "" : command.context());
            template.add("instructions", command.instructions());
            template.add("objectives", command.objectives() == null ? List.of() : command.objectives());
            template.add("totalPoints", command.totalPoints());
            template.add("rubricJson", jsonMapper.writeValueAsString(command.criteria()));
            template.add("evidenceBundle", buildEvidenceBundle(command.files()));
            return template.render();
        } catch (Exception exception) {
            throw new IllegalStateException("Could not render grading prompt", exception);
        }
    }

    private static String buildEvidenceBundle(List<SubmissionFile> files) {
        StringBuilder bundle = new StringBuilder();
        for (SubmissionFile file : files) {
            bundle.append("\n--- FILE: ").append(file.path()).append(" ---\n");
            String[] lines = file.content().split("\\R", -1);
            for (int index = 0; index < lines.length; index++) {
                bundle.append(index + 1).append(" | ").append(lines[index]).append('\n');
            }
        }
        return bundle.toString();
    }

    private static GradingResult validateOutput(GradingResult result, GradingCommand command) {
        if (result == null || result.criteria() == null
                || result.criteria().size() != command.criteria().size()
                || isBlank(result.overallFeedback())
                || isBlank(result.uncertaintySummary())) {
            throw new IllegalArgumentException("Output does not cover the rubric or is missing review context");
        }

        Map<String, GradingCriterion> criteriaById = new HashMap<>();
        command.criteria().forEach(criterion -> criteriaById.put(criterion.id(), criterion));
        Map<String, SubmissionFile> filesByPath = new HashMap<>();
        command.files().forEach(file -> filesByPath.put(file.path(), file));
        Set<String> seenCriteria = new HashSet<>();
        List<String> reviewFlags = new ArrayList<>(result.reviewFlags() == null ? List.of() : result.reviewFlags());
        var totalSuggested = java.math.BigDecimal.ZERO;

        for (GradingResult.CriterionSuggestion suggestion : result.criteria()) {
            if (suggestion == null || isBlank(suggestion.criterionId())
                    || !seenCriteria.add(suggestion.criterionId())) {
                throw new IllegalArgumentException("Output contains a missing or duplicate criterion");
            }
            GradingCriterion criterion = criteriaById.get(suggestion.criterionId());
            if (criterion == null || suggestion.suggestedPoints() == null
                    || suggestion.suggestedPoints().signum() < 0
                    || suggestion.suggestedPoints().compareTo(criterion.maxPoints()) > 0
                    || isBlank(suggestion.rationale())
                    || isBlank(suggestion.uncertainty())) {
                throw new IllegalArgumentException("Output contains an invalid score or rationale");
            }
            totalSuggested = totalSuggested.add(suggestion.suggestedPoints());

            List<GradingResult.EvidenceReference> evidence =
                    suggestion.evidence() == null ? List.of() : suggestion.evidence();
            if (evidence.isEmpty()) {
                reviewFlags.add("MISSING_EVIDENCE:" + criterion.id());
            }
            for (GradingResult.EvidenceReference reference : evidence) {
                verifyEvidenceReference(reference, filesByPath);
            }
        }

        if (totalSuggested.compareTo(command.totalPoints()) > 0) {
            throw new IllegalArgumentException("Suggested scores exceed the rubric total");
        }
        return new GradingResult(result.criteria(), result.overallFeedback(), result.uncertaintySummary(),
                reviewFlags.stream().distinct().toList());
    }

    private static void verifyEvidenceReference(
            GradingResult.EvidenceReference reference, Map<String, SubmissionFile> filesByPath) {
        if (reference == null || isBlank(reference.filePath()) || isBlank(reference.excerpt())
                || reference.lineStart() < 1 || reference.lineEnd() < reference.lineStart()) {
            throw new IllegalArgumentException("Evidence reference is incomplete");
        }
        SubmissionFile file = filesByPath.get(reference.filePath());
        if (file == null) {
            throw new IllegalArgumentException("Evidence references a file outside the submitted evidence");
        }
        String[] lines = file.content().split("\\R", -1);
        if (reference.lineEnd() > lines.length) {
            throw new IllegalArgumentException("Evidence line range exceeds the submitted file");
        }
        String snippet = String.join("\n",
                Arrays.copyOfRange(lines, reference.lineStart() - 1, reference.lineEnd()));
        if (!normalizeWhitespace(snippet).contains(normalizeWhitespace(reference.excerpt()))) {
            throw new IllegalArgumentException("Evidence excerpt does not match the submitted file");
        }
    }

    private GradingAgentException failure(
            Reason reason,
            String message,
            Throwable cause,
            String provider,
            String inputHash,
            StructuredGenerationResponse<GradingResult> response,
            Instant startedAt) {
        AgentExecutionLogPayload log = AgentExecutionLogPayload.builder()
                .agentExecutionId(UUID.randomUUID())
                .agentName(AGENT_NAME)
                .provider(provider)
                .model(response == null ? null : response.modelName())
                .promptVersion(promptVersion)
                .inputHash(inputHash)
                .outputHash(response == null || response.rawResponseText() == null
                        ? null : sha256Hex(response.rawResponseText()))
                .estimatedInputTokens(response == null ? null : response.estimatedInputTokens())
                .estimatedOutputTokens(response == null ? null : response.estimatedOutputTokens())
                .costEstimate(response == null ? null
                        : estimateCost(provider, response.estimatedInputTokens(), response.estimatedOutputTokens()))
                .status("FAILED")
                .errorCode(reason.name())
                .startedAt(startedAt)
                .finishedAt(Instant.now())
                .build();
        return cause == null
                ? new GradingAgentException(reason, message, log)
                : new GradingAgentException(reason, message, cause, log);
    }

    private Double estimateCost(String provider, Integer inputTokens, Integer outputTokens) {
        Double rate = costPerKTokensByProvider.get(provider);
        if (rate == null || inputTokens == null || outputTokens == null) {
            return null;
        }
        return ((inputTokens + outputTokens) / 1000.0) * rate;
    }

    private static String normalizeWhitespace(String value) {
        return value == null ? "" : value.replaceAll("\\s+", " ").strip();
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private static String sha256Hex(String value) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }
}
