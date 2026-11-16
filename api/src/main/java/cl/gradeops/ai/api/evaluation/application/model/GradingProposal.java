package cl.gradeops.ai.api.evaluation.application.model;

import java.util.List;

public record GradingProposal(
        List<GradingCriterionSuggestion> criteria,
        String overallFeedback,
        String uncertaintySummary,
        List<String> reviewFlags) {
}
