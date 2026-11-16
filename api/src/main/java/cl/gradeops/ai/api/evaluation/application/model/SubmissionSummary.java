package cl.gradeops.ai.api.evaluation.application.model;

import java.util.UUID;

public record SubmissionSummary(
        UUID id,
        String learnerLabel,
        String sourceDirectory,
        String status,
        int fileCount,
        int textFileCount) {
}
