package cl.gradeops.ai.api.evaluation.application.model;

public record GradingEvidenceReference(String filePath, int lineStart, int lineEnd, String excerpt) {
}
