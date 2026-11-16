package cl.gradeops.ai.api.evaluation.application.model;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record GradingContext(
        UUID assessmentId,
        UUID submissionId,
        UUID rubricVersionId,
        String assessmentTitle,
        String assessmentContext,
        String assessmentInstructions,
        List<String> objectives,
        BigDecimal totalPoints,
        List<RubricCriterion> criteria,
        String learnerLabel,
        List<SubmissionFileEvidence> files) {
}
