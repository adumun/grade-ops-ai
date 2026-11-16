package cl.gradeops.ai.api.evaluation.application.model;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record RubricView(
        UUID id,
        UUID assessmentId,
        UUID assessmentRevisionId,
        int versionNumber,
        String title,
        BigDecimal totalPoints,
        String status,
        List<RubricCriterion> criteria,
        String createdBy,
        String approvedBy,
        Instant createdAt,
        Instant approvedAt) {
}
