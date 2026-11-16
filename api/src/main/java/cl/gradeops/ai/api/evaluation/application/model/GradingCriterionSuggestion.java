package cl.gradeops.ai.api.evaluation.application.model;

import java.math.BigDecimal;
import java.util.List;

public record GradingCriterionSuggestion(
        String criterionId,
        String criterionName,
        BigDecimal maxPoints,
        BigDecimal suggestedPoints,
        String rationale,
        List<GradingEvidenceReference> evidence,
        String uncertainty,
        String confidence) {
}
