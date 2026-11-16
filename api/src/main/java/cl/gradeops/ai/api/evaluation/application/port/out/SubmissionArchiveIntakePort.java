package cl.gradeops.ai.api.evaluation.application.port.out;

import cl.gradeops.ai.api.evaluation.application.model.SubmissionCandidate;

import java.io.InputStream;
import java.util.List;

public interface SubmissionArchiveIntakePort {
    List<SubmissionCandidate> read(InputStream archive);
}
