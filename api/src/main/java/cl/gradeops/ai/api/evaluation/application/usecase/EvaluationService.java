package cl.gradeops.ai.api.evaluation.application.usecase;

import cl.gradeops.ai.api.evaluation.application.command.CreateRubricDraftCommand;
import cl.gradeops.ai.api.evaluation.application.exception.EvaluationConflictException;
import cl.gradeops.ai.api.evaluation.application.exception.InvalidEvaluationRequestException;
import cl.gradeops.ai.api.evaluation.application.model.RubricCriterion;
import cl.gradeops.ai.api.evaluation.application.model.RubricView;
import cl.gradeops.ai.api.evaluation.application.model.SubmissionBatchView;
import cl.gradeops.ai.api.evaluation.application.model.SubmissionCandidate;
import cl.gradeops.ai.api.evaluation.application.model.SubmissionEvidenceView;
import cl.gradeops.ai.api.evaluation.application.port.out.EvaluationRepositoryPort;
import cl.gradeops.ai.api.evaluation.application.port.out.SubmissionArchiveIntakePort;

import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/** Coordinates teacher-facing rubric and submission-intake use cases. */
public class EvaluationService {

    private final EvaluationRepositoryPort repository;
    private final SubmissionArchiveIntakePort archiveIntake;
    private final long maxArchiveBytes;

    public EvaluationService(
            EvaluationRepositoryPort repository,
            SubmissionArchiveIntakePort archiveIntake,
            long maxArchiveBytes) {
        this.repository = repository;
        this.archiveIntake = archiveIntake;
        this.maxArchiveBytes = maxArchiveBytes;
    }

    public RubricView createRubricDraft(UUID assessmentId, String teacherUid, CreateRubricDraftCommand command) {
        validateRubric(command);
        return repository.createRubricDraft(assessmentId, teacherUid, command);
    }

    public List<RubricView> listRubrics(UUID assessmentId, String teacherUid) {
        return repository.listRubrics(assessmentId, teacherUid);
    }

    public RubricView approveRubric(UUID assessmentId, UUID rubricId, String teacherUid) {
        return repository.approveRubric(assessmentId, rubricId, teacherUid);
    }

    public SubmissionBatchView uploadSubmissions(
            UUID assessmentId, String teacherUid, String filename, long archiveSize, InputStream archive) {
        if (filename == null || !filename.toLowerCase().endsWith(".zip")) {
            throw new InvalidEvaluationRequestException("Only ZIP archives are supported");
        }
        if (archiveSize <= 0 || archiveSize > maxArchiveBytes) {
            throw new InvalidEvaluationRequestException("ZIP archive exceeds the allowed upload size");
        }

        List<SubmissionCandidate> submissions;
        try {
            submissions = archiveIntake.read(archive);
        } catch (IllegalArgumentException exception) {
            throw new InvalidEvaluationRequestException(exception.getMessage(), exception);
        }

        String safeFilename = filename.replace('\\', '/');
        safeFilename = safeFilename.substring(safeFilename.lastIndexOf('/') + 1);
        if (safeFilename.isBlank()) {
            safeFilename = "submissions.zip";
        }
        return repository.createSubmissionBatch(assessmentId, teacherUid, safeFilename, submissions);
    }

    public SubmissionBatchView getSubmissionBatch(UUID batchId, String teacherUid) {
        return repository.getSubmissionBatch(batchId, teacherUid);
    }

    public SubmissionEvidenceView getSubmissionEvidence(UUID submissionId, String teacherUid) {
        return repository.getSubmissionEvidence(submissionId, teacherUid);
    }

    private static void validateRubric(CreateRubricDraftCommand command) {
        if (command == null || command.title() == null || command.title().isBlank()) {
            throw new InvalidEvaluationRequestException("Rubric title is required");
        }
        if (command.totalPoints() == null || command.totalPoints().compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidEvaluationRequestException("Rubric total points must be greater than zero");
        }
        if (command.criteria() == null || command.criteria().isEmpty() || command.criteria().size() > 20) {
            throw new InvalidEvaluationRequestException("A rubric must contain between 1 and 20 criteria");
        }

        Set<String> ids = new HashSet<>();
        BigDecimal sum = BigDecimal.ZERO;
        for (RubricCriterion criterion : command.criteria()) {
            if (criterion == null || criterion.id() == null || criterion.id().isBlank()
                    || criterion.name() == null || criterion.name().isBlank()
                    || criterion.description() == null || criterion.description().isBlank()
                    || criterion.maxPoints() == null
                    || criterion.maxPoints().compareTo(BigDecimal.ZERO) <= 0) {
                throw new InvalidEvaluationRequestException("Every rubric criterion needs a name, description and positive score");
            }
            if (!ids.add(criterion.id())) {
                throw new InvalidEvaluationRequestException("Rubric criterion identifiers must be unique");
            }
            sum = sum.add(criterion.maxPoints());
        }
        if (sum.compareTo(command.totalPoints()) != 0) {
            throw new InvalidEvaluationRequestException("Criterion maximum scores must add up to the rubric total");
        }
    }
}
