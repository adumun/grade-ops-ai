package cl.gradeops.ai.api.evaluation.application.model;

import java.util.List;
import java.util.UUID;

public record SubmissionEvidenceView(
        UUID id,
        String learnerLabel,
        String sourceDirectory,
        String status,
        List<SubmissionFileEvidence> files) {
}
