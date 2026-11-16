package cl.gradeops.ai.api.evaluation.application.model;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record SubmissionBatchView(
        UUID id,
        UUID assessmentId,
        String originalFilename,
        String status,
        int totalFiles,
        int totalSubmissions,
        List<SubmissionSummary> submissions,
        Instant createdAt) {
}
