package cl.gradeops.ai.api.evaluation.application.model;

import java.time.Instant;

public record GradingExecutionMetadata(
        String provider,
        String model,
        String promptVersion,
        String inputHash,
        String outputHash,
        Integer estimatedInputTokens,
        Integer estimatedOutputTokens,
        Double costEstimate,
        String status,
        String errorCode,
        Instant startedAt,
        Instant finishedAt) {
}
