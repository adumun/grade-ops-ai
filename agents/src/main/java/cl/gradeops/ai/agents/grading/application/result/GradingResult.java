package cl.gradeops.ai.agents.grading.application.result;

import java.math.BigDecimal;
import java.util.List;

public record GradingResult(
        List<CriterionSuggestion> criteria,
        String overallFeedback,
        String uncertaintySummary,
        List<String> reviewFlags) {

    public record CriterionSuggestion(
            String criterionId,
            BigDecimal suggestedPoints,
            String rationale,
            List<EvidenceReference> evidence,
            String uncertainty,
            String confidence) {
    }

    public record EvidenceReference(
            String filePath,
            int lineStart,
            int lineEnd,
            String excerpt) {
    }
}
