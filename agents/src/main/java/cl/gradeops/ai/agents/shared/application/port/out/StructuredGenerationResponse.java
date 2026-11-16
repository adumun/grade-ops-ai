package cl.gradeops.ai.agents.shared.application.port.out;

public record StructuredGenerationResponse<T>(
        T result,
        String rawResponseText,
        String modelName,
        Integer estimatedInputTokens,
        Integer estimatedOutputTokens) {
}
