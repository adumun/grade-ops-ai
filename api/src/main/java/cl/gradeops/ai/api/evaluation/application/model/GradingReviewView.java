package cl.gradeops.ai.api.evaluation.application.model;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record GradingReviewView(
        UUID id,
        UUID gradingRunId,
        UUID submissionId,
        String learnerLabel,
        String status,
        GradingProposal proposal,
        GradingProposal editedResult,
        BigDecimal finalScore,
        String teacherComment,
        GradingExecutionMetadata execution,
        String approvedBy,
        Instant approvedAt) {
}
