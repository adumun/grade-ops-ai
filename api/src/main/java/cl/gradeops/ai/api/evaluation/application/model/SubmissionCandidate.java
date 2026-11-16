package cl.gradeops.ai.api.evaluation.application.model;

import java.util.List;

public record SubmissionCandidate(
        String learnerLabel,
        String sourceDirectory,
        List<SubmissionFileEvidence> files) {

    public SubmissionCandidate {
        files = files == null ? List.of() : List.copyOf(files);
    }
}
