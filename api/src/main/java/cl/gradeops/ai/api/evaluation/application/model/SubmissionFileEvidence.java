package cl.gradeops.ai.api.evaluation.application.model;

public record SubmissionFileEvidence(
        String path,
        String mediaType,
        long sizeBytes,
        String sha256,
        String classification,
        String extractedText) {
}
