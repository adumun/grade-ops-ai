package cl.gradeops.ai.api.evaluation.application.port.out;

import cl.gradeops.ai.api.evaluation.application.command.CreateRubricDraftCommand;
import cl.gradeops.ai.api.evaluation.application.model.RubricView;
import cl.gradeops.ai.api.evaluation.application.model.SubmissionBatchView;
import cl.gradeops.ai.api.evaluation.application.model.SubmissionCandidate;
import cl.gradeops.ai.api.evaluation.application.model.SubmissionEvidenceView;

import java.util.List;
import java.util.UUID;

public interface EvaluationRepositoryPort {
    RubricView createRubricDraft(UUID assessmentId, String teacherUid, CreateRubricDraftCommand command);
    List<RubricView> listRubrics(UUID assessmentId, String teacherUid);
    RubricView approveRubric(UUID assessmentId, UUID rubricId, String teacherUid);
    SubmissionBatchView createSubmissionBatch(
            UUID assessmentId, String teacherUid, String filename, List<SubmissionCandidate> submissions);
    SubmissionBatchView getSubmissionBatch(UUID batchId, String teacherUid);
    SubmissionEvidenceView getSubmissionEvidence(UUID submissionId, String teacherUid);
}
