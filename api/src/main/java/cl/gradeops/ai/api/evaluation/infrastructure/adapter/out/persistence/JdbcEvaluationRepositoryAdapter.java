package cl.gradeops.ai.api.evaluation.infrastructure.adapter.out.persistence;

import cl.gradeops.ai.api.evaluation.application.command.CreateRubricDraftCommand;
import cl.gradeops.ai.api.evaluation.application.exception.EvaluationConflictException;
import cl.gradeops.ai.api.evaluation.application.model.RubricCriterion;
import cl.gradeops.ai.api.evaluation.application.model.GradingAgentResult;
import cl.gradeops.ai.api.evaluation.application.model.GradingContext;
import cl.gradeops.ai.api.evaluation.application.model.GradingCriterionSuggestion;
import cl.gradeops.ai.api.evaluation.application.model.GradingExecutionMetadata;
import cl.gradeops.ai.api.evaluation.application.model.GradingProposal;
import cl.gradeops.ai.api.evaluation.application.model.GradingReviewView;
import cl.gradeops.ai.api.evaluation.application.model.GradingEvidenceReference;
import cl.gradeops.ai.api.evaluation.application.model.RubricView;
import cl.gradeops.ai.api.evaluation.application.model.SubmissionBatchView;
import cl.gradeops.ai.api.evaluation.application.model.SubmissionCandidate;
import cl.gradeops.ai.api.evaluation.application.model.SubmissionEvidenceView;
import cl.gradeops.ai.api.evaluation.application.model.SubmissionFileEvidence;
import cl.gradeops.ai.api.evaluation.application.model.SubmissionSummary;
import cl.gradeops.ai.api.evaluation.application.port.out.EvaluationRepositoryPort;
import cl.gradeops.ai.api.shared.domain.exception.ResourceNotFoundException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.json.JsonMapper;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.List;
import java.util.UUID;

public class JdbcEvaluationRepositoryAdapter implements EvaluationRepositoryPort {

    private static final RowMapper<RubricView> RUBRIC_MAPPER = (rs, row) -> mapRubric(rs);
    private final JdbcTemplate jdbc;
    private final JsonMapper jsonMapper;

    public JdbcEvaluationRepositoryAdapter(JdbcTemplate jdbc, JsonMapper jsonMapper) {
        this.jdbc = jdbc;
        this.jsonMapper = jsonMapper;
    }

    @Override
    @Transactional
    public RubricView createRubricDraft(UUID assessmentId, String teacherUid, CreateRubricDraftCommand command) {
        UUID revisionId = lockCurrentRevision(assessmentId, teacherUid);
        if (revisionId == null) {
            throw new EvaluationConflictException("Generate and review an assessment draft before creating its rubric");
        }

        Integer nextVersion = jdbc.queryForObject(
                "SELECT COALESCE(MAX(version_number), 0) + 1 FROM assessment_rubric_versions WHERE assessment_id = ?",
                Integer.class,
                assessmentId);
        UUID rubricId = UUID.randomUUID();
        jdbc.update("""
                INSERT INTO assessment_rubric_versions
                    (id, assessment_id, assessment_revision_id, version_number, title, total_points,
                     criteria, status, created_by)
                VALUES (?, ?, ?, ?, ?, ?, ?::jsonb, 'DRAFT', ?)
                """,
                rubricId,
                assessmentId,
                revisionId,
                nextVersion,
                command.title().trim(),
                command.totalPoints(),
                writeJson(command.criteria()),
                teacherUid);

        return findRubric(rubricId, assessmentId, teacherUid);
    }

    @Override
    public List<RubricView> listRubrics(UUID assessmentId, String teacherUid) {
        assertAssessmentOwner(assessmentId, teacherUid);
        return jdbc.query("""
                SELECT r.*
                FROM assessment_rubric_versions r
                JOIN assessments a ON a.id = r.assessment_id
                WHERE r.assessment_id = ? AND a.teacher_uid = ?
                ORDER BY r.version_number DESC
                """, RUBRIC_MAPPER, assessmentId, teacherUid);
    }

    @Override
    @Transactional
    public RubricView updateRubricDraft(
            UUID assessmentId, UUID rubricId, String teacherUid, CreateRubricDraftCommand command) {
        RubricView current = findRubric(rubricId, assessmentId, teacherUid);
        if (!"DRAFT".equals(current.status())) {
            throw new EvaluationConflictException("Only a draft rubric can be edited");
        }
        UUID currentRevisionId = lockCurrentRevision(assessmentId, teacherUid);
        if (!current.assessmentRevisionId().equals(currentRevisionId)) {
            throw new EvaluationConflictException("Assessment instructions changed; create a new rubric version");
        }
        int updated = jdbc.update("""
                UPDATE assessment_rubric_versions
                SET title = ?, total_points = ?, criteria = ?::jsonb
                WHERE id = ? AND assessment_id = ? AND status = 'DRAFT'
                """,
                command.title().trim(),
                command.totalPoints(),
                writeJson(command.criteria()),
                rubricId,
                assessmentId);
        if (updated != 1) {
            throw new EvaluationConflictException("Rubric changed while the teacher edit was being saved");
        }
        return findRubric(rubricId, assessmentId, teacherUid);
    }

    @Override
    @Transactional
    public RubricView approveRubric(UUID assessmentId, UUID rubricId, String teacherUid) {
        RubricView rubric = findRubric(rubricId, assessmentId, teacherUid);
        if (!"DRAFT".equals(rubric.status())) {
            throw new EvaluationConflictException("Only a draft rubric can be approved");
        }

        jdbc.update("""
                UPDATE assessment_rubric_versions
                SET status = 'SUPERSEDED'
                WHERE assessment_id = ?
                  AND assessment_revision_id = ?
                  AND status = 'APPROVED'
                """, assessmentId, rubric.assessmentRevisionId());

        int updated = jdbc.update("""
                UPDATE assessment_rubric_versions
                SET status = 'APPROVED', approved_by = ?, approved_at = now()
                WHERE id = ? AND assessment_id = ? AND status = 'DRAFT'
                """, teacherUid, rubricId, assessmentId);
        if (updated != 1) {
            throw new EvaluationConflictException("Rubric changed while approval was being recorded");
        }
        return findRubric(rubricId, assessmentId, teacherUid);
    }

    @Override
    @Transactional
    public SubmissionBatchView createSubmissionBatch(
            UUID assessmentId, String teacherUid, String filename, List<SubmissionCandidate> submissions) {
        UUID revisionId = lockCurrentRevision(assessmentId, teacherUid);
        if (revisionId == null) {
            throw new EvaluationConflictException("An assessment revision is required before submission intake");
        }
        Integer approvedRubrics = jdbc.queryForObject("""
                SELECT COUNT(*)
                FROM assessment_rubric_versions
                WHERE assessment_id = ?
                  AND assessment_revision_id = ?
                  AND status = 'APPROVED'
                """, Integer.class, assessmentId, revisionId);
        if (approvedRubrics == null || approvedRubrics == 0) {
            throw new EvaluationConflictException("Approve a rubric before uploading student submissions");
        }

        UUID batchId = UUID.randomUUID();
        int totalFiles = submissions.stream().mapToInt(candidate -> candidate.files().size()).sum();
        jdbc.update("""
                INSERT INTO submission_batches
                    (id, assessment_id, original_filename, status, total_files, total_submissions, uploaded_by)
                VALUES (?, ?, ?, 'READY', ?, ?, ?)
                """, batchId, assessmentId, filename, totalFiles, submissions.size(), teacherUid);

        for (SubmissionCandidate candidate : submissions) {
            UUID submissionId = UUID.randomUUID();
            int textFiles = (int) candidate.files().stream()
                    .filter(file -> "TEXT".equals(file.classification()))
                    .count();
            jdbc.update("""
                    INSERT INTO submissions
                        (id, batch_id, learner_label, source_directory, status, file_count, text_file_count)
                    VALUES (?, ?, ?, ?, 'READY', ?, ?)
                    """,
                    submissionId,
                    batchId,
                    candidate.learnerLabel(),
                    candidate.sourceDirectory(),
                    candidate.files().size(),
                    textFiles);

            for (SubmissionFileEvidence file : candidate.files()) {
                jdbc.update("""
                        INSERT INTO submission_files
                            (id, submission_id, relative_path, media_type, size_bytes, sha256, classification, extracted_text)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                        """,
                        UUID.randomUUID(),
                        submissionId,
                        file.path(),
                        file.mediaType(),
                        file.sizeBytes(),
                        file.sha256(),
                        file.classification(),
                        file.extractedText());
            }
        }
        return getSubmissionBatch(batchId, teacherUid);
    }

    @Override
    public SubmissionBatchView getSubmissionBatch(UUID batchId, String teacherUid) {
        BatchHeader header;
        try {
            header = jdbc.queryForObject("""
                    SELECT b.id, b.assessment_id, b.original_filename, b.status,
                           b.total_files, b.total_submissions, b.created_at
                    FROM submission_batches b
                    JOIN assessments a ON a.id = b.assessment_id
                    WHERE b.id = ? AND a.teacher_uid = ?
                    """,
                    (rs, row) -> new BatchHeader(
                            rs.getObject("id", UUID.class),
                            rs.getObject("assessment_id", UUID.class),
                            rs.getString("original_filename"),
                            rs.getString("status"),
                            rs.getInt("total_files"),
                            rs.getInt("total_submissions"),
                            instant(rs.getTimestamp("created_at"))),
                    batchId,
                    teacherUid);
        } catch (EmptyResultDataAccessException exception) {
            throw new ResourceNotFoundException(batchId.toString());
        }

        List<SubmissionSummary> submissions = jdbc.query("""
                SELECT s.id, s.learner_label, s.source_directory, s.status, s.file_count, s.text_file_count,
                       (SELECT gr.id FROM grading_runs gr
                        JOIN grading_reviews review ON review.grading_run_id = gr.id
                        WHERE gr.submission_id = s.id
                        ORDER BY gr.started_at DESC LIMIT 1) AS latest_grading_run_id
                FROM submissions s
                WHERE s.batch_id = ?
                ORDER BY s.learner_label
                """,
                (rs, row) -> new SubmissionSummary(
                        rs.getObject("id", UUID.class),
                        rs.getString("learner_label"),
                        rs.getString("source_directory"),
                        rs.getString("status"),
                        rs.getInt("file_count"),
                        rs.getInt("text_file_count"),
                        rs.getObject("latest_grading_run_id", UUID.class)),
                batchId);

        return new SubmissionBatchView(
                header.id(),
                header.assessmentId(),
                header.filename(),
                header.status(),
                header.totalFiles(),
                header.totalSubmissions(),
                submissions,
                header.createdAt());
    }

    @Override
    public List<SubmissionBatchView> listSubmissionBatches(UUID assessmentId, String teacherUid) {
        assertAssessmentOwner(assessmentId, teacherUid);
        List<UUID> batchIds = jdbc.query("""
                SELECT id FROM submission_batches
                WHERE assessment_id = ?
                ORDER BY created_at DESC
                """, (rs, row) -> rs.getObject("id", UUID.class), assessmentId);
        return batchIds.stream().map(id -> getSubmissionBatch(id, teacherUid)).toList();
    }

    @Override
    public SubmissionEvidenceView getSubmissionEvidence(UUID submissionId, String teacherUid) {
        SubmissionHeader header;
        try {
            header = jdbc.queryForObject("""
                    SELECT s.id, s.learner_label, s.source_directory, s.status
                    FROM submissions s
                    JOIN submission_batches b ON b.id = s.batch_id
                    JOIN assessments a ON a.id = b.assessment_id
                    WHERE s.id = ? AND a.teacher_uid = ?
                    """,
                    (rs, row) -> new SubmissionHeader(
                            rs.getObject("id", UUID.class),
                            rs.getString("learner_label"),
                            rs.getString("source_directory"),
                            rs.getString("status")),
                    submissionId,
                    teacherUid);
        } catch (EmptyResultDataAccessException exception) {
            throw new ResourceNotFoundException(submissionId.toString());
        }

        List<SubmissionFileEvidence> files = jdbc.query("""
                SELECT relative_path, media_type, size_bytes, sha256, classification, extracted_text
                FROM submission_files
                WHERE submission_id = ?
                ORDER BY relative_path
                """,
                (rs, row) -> new SubmissionFileEvidence(
                        rs.getString("relative_path"),
                        rs.getString("media_type"),
                        rs.getLong("size_bytes"),
                        rs.getString("sha256"),
                        rs.getString("classification"),
                        rs.getString("extracted_text")),
                submissionId);

        return new SubmissionEvidenceView(
                header.id(), header.learnerLabel(), header.sourceDirectory(), header.status(), files);
    }


    @Override
    public GradingContext getGradingContext(UUID submissionId, String teacherUid) {
        assertSubmissionOwner(submissionId, teacherUid);
        GradingContextHeader header;
        try {
            header = jdbc.queryForObject("""
                    SELECT a.id AS assessment_id, s.id AS submission_id, rv.id AS rubric_version_id,
                           r.title AS assessment_title, r.context AS assessment_context,
                           r.instructions AS assessment_instructions, r.objectives::text AS objectives,
                           rv.total_points, rv.criteria::text AS criteria, s.learner_label
                    FROM submissions s
                    JOIN submission_batches b ON b.id = s.batch_id
                    JOIN assessments a ON a.id = b.assessment_id
                    JOIN assessment_revisions r ON r.id = a.current_revision_id
                    JOIN assessment_rubric_versions rv
                      ON rv.assessment_id = a.id
                     AND rv.assessment_revision_id = r.id
                     AND rv.status = 'APPROVED'
                    WHERE s.id = ? AND a.teacher_uid = ?
                    ORDER BY rv.version_number DESC
                    LIMIT 1
                    """,
                    (rs, row) -> new GradingContextHeader(
                            rs.getObject("assessment_id", UUID.class),
                            rs.getObject("submission_id", UUID.class),
                            rs.getObject("rubric_version_id", UUID.class),
                            rs.getString("assessment_title"),
                            rs.getString("assessment_context"),
                            rs.getString("assessment_instructions"),
                            readStrings(rs.getString("objectives")),
                            rs.getBigDecimal("total_points"),
                            readCriteria(rs.getString("criteria")),
                            rs.getString("learner_label")),
                    submissionId,
                    teacherUid);
        } catch (EmptyResultDataAccessException exception) {
            throw new EvaluationConflictException(
                    "The submission cannot be graded until an approved rubric exists for the current assessment revision");
        }

        List<SubmissionFileEvidence> files = jdbc.query("""
                SELECT relative_path, media_type, size_bytes, sha256, classification, extracted_text
                FROM submission_files
                WHERE submission_id = ?
                ORDER BY relative_path
                """,
                (rs, row) -> new SubmissionFileEvidence(
                        rs.getString("relative_path"),
                        rs.getString("media_type"),
                        rs.getLong("size_bytes"),
                        rs.getString("sha256"),
                        rs.getString("classification"),
                        rs.getString("extracted_text")),
                submissionId);

        return new GradingContext(
                header.assessmentId(),
                header.submissionId(),
                header.rubricVersionId(),
                header.assessmentTitle(),
                header.assessmentContext(),
                header.assessmentInstructions(),
                header.objectives(),
                header.totalPoints(),
                header.criteria(),
                header.learnerLabel(),
                files);
    }

    @Override
    @Transactional
    public UUID startGradingRun(GradingContext context, String teacherUid, Instant startedAt) {
        assertAssessmentOwner(context.assessmentId(), teacherUid);
        Integer owned = jdbc.queryForObject("""
                SELECT COUNT(*)
                FROM submissions s
                JOIN submission_batches b ON b.id = s.batch_id
                WHERE s.id = ? AND b.assessment_id = ?
                """, Integer.class, context.submissionId(), context.assessmentId());
        if (owned == null || owned == 0) {
            throw new ResourceNotFoundException(context.submissionId().toString());
        }

        UUID runId = UUID.randomUUID();
        jdbc.update("""
                INSERT INTO grading_runs
                    (id, assessment_id, submission_id, rubric_version_id, status, started_at)
                VALUES (?, ?, ?, ?, 'PENDING', ?)
                """,
                runId, context.assessmentId(), context.submissionId(), context.rubricVersionId(), Timestamp.from(startedAt));
        return runId;
    }

    @Override
    @Transactional
    public GradingReviewView completeGradingRun(UUID gradingRunId, GradingAgentResult result, String teacherUid) {
        GradingExecutionMetadata execution = result.execution();
        String proposalJson = writeJson(result.proposal());
        int updated = jdbc.update("""
                UPDATE grading_runs
                SET status = 'COMPLETED', proposal = ?::jsonb, provider = ?, model = ?, prompt_version = ?,
                    input_hash = ?, output_hash = ?, estimated_input_tokens = ?, estimated_output_tokens = ?,
                    cost_estimate = ?, error_code = ?, finished_at = ?
                WHERE id = ? AND status = 'PENDING'
                """,
                proposalJson,
                execution.provider(),
                execution.model(),
                execution.promptVersion(),
                execution.inputHash(),
                execution.outputHash(),
                execution.estimatedInputTokens(),
                execution.estimatedOutputTokens(),
                execution.costEstimate(),
                execution.errorCode(),
                execution.finishedAt() == null ? Timestamp.from(Instant.now()) : Timestamp.from(execution.finishedAt()),
                gradingRunId);
        if (updated != 1) {
            throw new EvaluationConflictException("Grading run is no longer pending");
        }

        UUID reviewId = UUID.randomUUID();
        jdbc.update("""
                INSERT INTO grading_reviews (id, grading_run_id, status, edited_result)
                VALUES (?, ?, 'DRAFT', ?::jsonb)
                """, reviewId, gradingRunId, proposalJson);
        jdbc.update("""
                UPDATE submissions SET status = 'GRADED'
                WHERE id = (SELECT submission_id FROM grading_runs WHERE id = ?)
                """, gradingRunId);
        insertReviewEvent(reviewId, "SYSTEM:AI", "AI_PROPOSAL_CREATED", result.proposal());
        return getGradingReview(gradingRunId, teacherUid);
    }

    @Override
    @Transactional
    public void failGradingRun(UUID gradingRunId, GradingExecutionMetadata execution) {
        jdbc.update("""
                UPDATE grading_runs
                SET status = 'FAILED', provider = ?, model = ?, prompt_version = ?, input_hash = ?,
                    output_hash = ?, estimated_input_tokens = ?, estimated_output_tokens = ?, cost_estimate = ?,
                    error_code = ?, finished_at = ?
                WHERE id = ? AND status = 'PENDING'
                """,
                execution.provider(),
                execution.model(),
                execution.promptVersion(),
                execution.inputHash(),
                execution.outputHash(),
                execution.estimatedInputTokens(),
                execution.estimatedOutputTokens(),
                execution.costEstimate(),
                execution.errorCode(),
                execution.finishedAt() == null ? Timestamp.from(Instant.now()) : Timestamp.from(execution.finishedAt()),
                gradingRunId);
    }

    @Override
    public GradingReviewView getGradingReview(UUID gradingRunId, String teacherUid) {
        try {
            return jdbc.queryForObject("""
                    SELECT r.id AS review_id, gr.id AS grading_run_id, s.id AS submission_id,
                           s.learner_label, r.status AS review_status, gr.proposal::text AS proposal,
                           r.edited_result::text AS edited_result, r.final_score, r.teacher_comment,
                           gr.provider, gr.model, gr.prompt_version, gr.input_hash, gr.output_hash,
                           gr.estimated_input_tokens, gr.estimated_output_tokens, gr.cost_estimate,
                           gr.status AS execution_status, gr.error_code, gr.started_at, gr.finished_at,
                           r.approved_by, r.approved_at
                    FROM grading_reviews r
                    JOIN grading_runs gr ON gr.id = r.grading_run_id
                    JOIN submissions s ON s.id = gr.submission_id
                    JOIN submission_batches b ON b.id = s.batch_id
                    JOIN assessments a ON a.id = b.assessment_id
                    WHERE gr.id = ? AND a.teacher_uid = ?
                    """,
                    (rs, row) -> mapGradingReview(rs),
                    gradingRunId,
                    teacherUid);
        } catch (EmptyResultDataAccessException exception) {
            throw new ResourceNotFoundException(gradingRunId.toString());
        }
    }

    @Override
    public GradingReviewView getLatestGradingReview(UUID submissionId, String teacherUid) {
        assertSubmissionOwner(submissionId, teacherUid);
        List<UUID> runIds = jdbc.query("""
                SELECT gr.id
                FROM grading_runs gr
                JOIN grading_reviews r ON r.grading_run_id = gr.id
                JOIN submissions s ON s.id = gr.submission_id
                JOIN submission_batches b ON b.id = s.batch_id
                JOIN assessments a ON a.id = b.assessment_id
                WHERE gr.submission_id = ? AND a.teacher_uid = ?
                ORDER BY gr.started_at DESC
                LIMIT 1
                """, (rs, row) -> rs.getObject(1, UUID.class), submissionId, teacherUid);
        return runIds.isEmpty() ? null : getGradingReview(runIds.getFirst(), teacherUid);
    }

    @Override
    @Transactional
    public GradingReviewView updateGradingReview(
            UUID gradingRunId, String teacherUid, GradingProposal editedResult, String teacherComment) {
        GradingReviewView current = getGradingReview(gradingRunId, teacherUid);
        if (!"DRAFT".equals(current.status())) {
            throw new EvaluationConflictException("Only a draft grading review can be edited");
        }
        List<RubricCriterion> canonicalCriteria = loadRubricCriteria(gradingRunId, teacherUid);
        SubmissionEvidenceView evidence = getSubmissionEvidence(current.submissionId(), teacherUid);
        GradingProposal canonicalResult = canonicalizeProposal(editedResult, canonicalCriteria, evidence.files());
        BigDecimal finalScore = canonicalResult.criteria().stream()
                .map(GradingCriterionSuggestion::suggestedPoints)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        String editedJson = writeJson(canonicalResult);
        int updated = jdbc.update("""
                UPDATE grading_reviews
                SET edited_result = ?::jsonb, final_score = ?, teacher_comment = ?, updated_at = now()
                WHERE grading_run_id = ? AND status = 'DRAFT'
                """, editedJson, finalScore, teacherComment, gradingRunId);
        if (updated != 1) {
            throw new EvaluationConflictException("Grading review changed while the teacher edit was being saved");
        }
        insertReviewEvent(current.id(), teacherUid, "TEACHER_EDITED", Map.of(
                "editedResult", canonicalResult,
                "teacherComment", teacherComment == null ? "" : teacherComment,
                "finalScore", finalScore));
        return getGradingReview(gradingRunId, teacherUid);
    }

    @Override
    @Transactional
    public GradingReviewView approveGradingReview(UUID gradingRunId, String teacherUid) {
        GradingReviewView current = getGradingReview(gradingRunId, teacherUid);
        if (!"DRAFT".equals(current.status()) || current.finalScore() == null) {
            throw new EvaluationConflictException("A teacher-edited grading result must be saved before approval");
        }
        jdbc.update("""
                UPDATE grading_reviews previous
                SET status = 'SUPERSEDED', updated_at = now()
                FROM grading_runs previous_run
                WHERE previous.grading_run_id = previous_run.id
                  AND previous_run.submission_id = ?
                  AND previous.status = 'APPROVED'
                  AND previous.grading_run_id <> ?
                """, current.submissionId(), gradingRunId);
        int updated = jdbc.update("""
                UPDATE grading_reviews
                SET status = 'APPROVED', approved_by = ?, approved_at = now(), updated_at = now()
                WHERE grading_run_id = ? AND status = 'DRAFT' AND final_score IS NOT NULL
                """, teacherUid, gradingRunId);
        if (updated != 1) {
            throw new EvaluationConflictException("Grading review changed while approval was being recorded");
        }
        jdbc.update("UPDATE submissions SET status = 'APPROVED' WHERE id = ?", current.submissionId());
        insertReviewEvent(current.id(), teacherUid, "TEACHER_APPROVED",
                Map.of("finalScore", current.finalScore(), "approved", true));
        return getGradingReview(gradingRunId, teacherUid);
    }

    @Override
    public List<GradingReviewView> listApprovedReviews(UUID assessmentId, String teacherUid) {
        assertAssessmentOwner(assessmentId, teacherUid);
        List<UUID> runIds = jdbc.query("""
                SELECT gr.id
                FROM grading_runs gr
                JOIN grading_reviews r ON r.grading_run_id = gr.id
                WHERE gr.assessment_id = ? AND r.status = 'APPROVED'
                ORDER BY gr.started_at, gr.submission_id
                """, (rs, row) -> rs.getObject(1, UUID.class), assessmentId);
        return runIds.stream().map(id -> getGradingReview(id, teacherUid)).toList();
    }

    private void assertSubmissionOwner(UUID submissionId, String teacherUid) {
        Integer count = jdbc.queryForObject("""
                SELECT COUNT(*)
                FROM submissions s
                JOIN submission_batches b ON b.id = s.batch_id
                JOIN assessments a ON a.id = b.assessment_id
                WHERE s.id = ? AND a.teacher_uid = ?
                """, Integer.class, submissionId, teacherUid);
        if (count == null || count == 0) {
            throw new ResourceNotFoundException(submissionId.toString());
        }
    }

    private void insertReviewEvent(UUID reviewId, String actorUid, String eventType, Object payload) {
        jdbc.update("""
                INSERT INTO grading_review_events (id, review_id, actor_uid, event_type, payload)
                VALUES (?, ?, ?, ?, ?::jsonb)
                """, UUID.randomUUID(), reviewId, actorUid, eventType, writeJson(payload));
    }

    private List<RubricCriterion> loadRubricCriteria(UUID gradingRunId, String teacherUid) {
        try {
            String criteriaJson = jdbc.queryForObject("""
                    SELECT rv.criteria::text
                    FROM grading_runs gr
                    JOIN assessment_rubric_versions rv ON rv.id = gr.rubric_version_id
                    JOIN assessments a ON a.id = gr.assessment_id
                    WHERE gr.id = ? AND a.teacher_uid = ?
                    """, String.class, gradingRunId, teacherUid);
            return readCriteria(criteriaJson);
        } catch (EmptyResultDataAccessException exception) {
            throw new ResourceNotFoundException(gradingRunId.toString());
        }
    }

    private static GradingProposal canonicalizeProposal(
            GradingProposal proposal,
            List<RubricCriterion> rubricCriteria,
            List<SubmissionFileEvidence> submissionFiles) {
        if (proposal == null || proposal.criteria() == null
                || proposal.criteria().size() != rubricCriteria.size()
                || proposal.overallFeedback() == null || proposal.overallFeedback().isBlank()
                || proposal.uncertaintySummary() == null || proposal.uncertaintySummary().isBlank()) {
            throw new EvaluationConflictException("A complete teacher review is required for every rubric criterion");
        }

        Map<String, RubricCriterion> rubricById = rubricCriteria.stream()
                .collect(java.util.stream.Collectors.toMap(RubricCriterion::id, criterion -> criterion));
        Map<String, SubmissionFileEvidence> filesByPath = submissionFiles.stream()
                .filter(file -> "TEXT".equals(file.classification()))
                .collect(java.util.stream.Collectors.toMap(SubmissionFileEvidence::path, file -> file));
        Set<String> seen = new HashSet<>();
        List<String> reviewFlags = new ArrayList<>(
                proposal.reviewFlags() == null ? List.of() : proposal.reviewFlags());
        List<GradingCriterionSuggestion> canonicalCriteria = new ArrayList<>();
        for (GradingCriterionSuggestion suggestion : proposal.criteria()) {
            if (suggestion == null || suggestion.criterionId() == null || !seen.add(suggestion.criterionId())) {
                throw new EvaluationConflictException("Review contains a missing or duplicate rubric criterion");
            }
            RubricCriterion rubric = rubricById.get(suggestion.criterionId());
            if (rubric == null || suggestion.suggestedPoints() == null
                    || suggestion.suggestedPoints().signum() < 0
                    || suggestion.suggestedPoints().compareTo(rubric.maxPoints()) > 0
                    || suggestion.rationale() == null || suggestion.rationale().isBlank()) {
                throw new EvaluationConflictException("Review contains a score or rationale outside the approved rubric");
            }

            List<GradingEvidenceReference> evidence = suggestion.evidence() == null
                    ? List.of() : suggestion.evidence();
            if (evidence.isEmpty()) {
                reviewFlags.add("MISSING_EVIDENCE:" + rubric.id());
            }
            for (GradingEvidenceReference reference : evidence) {
                verifyTeacherEvidence(reference, filesByPath);
            }
            canonicalCriteria.add(new GradingCriterionSuggestion(
                    rubric.id(),
                    rubric.name(),
                    rubric.maxPoints(),
                    suggestion.suggestedPoints(),
                    suggestion.rationale(),
                    evidence,
                    suggestion.uncertainty() == null ? "" : suggestion.uncertainty(),
                    suggestion.confidence() == null ? "TEACHER_REVIEWED" : suggestion.confidence()));
        }
        return new GradingProposal(
                canonicalCriteria,
                proposal.overallFeedback(),
                proposal.uncertaintySummary(),
                reviewFlags.stream().distinct().toList());
    }

    private static void verifyTeacherEvidence(
            GradingEvidenceReference reference, Map<String, SubmissionFileEvidence> filesByPath) {
        if (reference == null || reference.filePath() == null || reference.filePath().isBlank()
                || reference.excerpt() == null || reference.excerpt().isBlank()
                || reference.lineStart() < 1 || reference.lineEnd() < reference.lineStart()) {
            throw new EvaluationConflictException("Evidence references must include a valid file and line range");
        }
        SubmissionFileEvidence file = filesByPath.get(reference.filePath());
        if (file == null || file.extractedText() == null) {
            throw new EvaluationConflictException("Evidence must reference a text file from this submission");
        }
        String[] lines = file.extractedText().split("\\R", -1);
        if (reference.lineEnd() > lines.length) {
            throw new EvaluationConflictException("Evidence line range is outside the submitted file");
        }
        String excerpt = String.join("\n", Arrays.copyOfRange(lines, reference.lineStart() - 1, reference.lineEnd()));
        if (!normalizeWhitespace(excerpt).contains(normalizeWhitespace(reference.excerpt()))) {
            throw new EvaluationConflictException("Evidence excerpt does not match the submitted file");
        }
    }

    private static String normalizeWhitespace(String value) {
        return value == null ? "" : value.replaceAll("\\s+", " ").strip();
    }

    private static GradingReviewView mapGradingReview(ResultSet rs) throws SQLException {
        return new GradingReviewView(
                rs.getObject("review_id", UUID.class),
                rs.getObject("grading_run_id", UUID.class),
                rs.getObject("submission_id", UUID.class),
                rs.getString("learner_label"),
                rs.getString("review_status"),
                readProposal(rs.getString("proposal")),
                readProposal(rs.getString("edited_result")),
                rs.getBigDecimal("final_score"),
                rs.getString("teacher_comment"),
                new GradingExecutionMetadata(
                        rs.getString("provider"),
                        rs.getString("model"),
                        rs.getString("prompt_version"),
                        rs.getString("input_hash"),
                        rs.getString("output_hash"),
                        (Integer) rs.getObject("estimated_input_tokens"),
                        (Integer) rs.getObject("estimated_output_tokens"),
                        (Double) rs.getObject("cost_estimate"),
                        rs.getString("execution_status"),
                        rs.getString("error_code"),
                        instant(rs.getTimestamp("started_at")),
                        instant(rs.getTimestamp("finished_at"))),
                rs.getString("approved_by"),
                instant(rs.getTimestamp("approved_at")));
    }

    private static GradingProposal readProposal(String json) {
        try {
            return JSON_MAPPER.readValue(json, GradingProposal.class);
        } catch (Exception exception) {
            throw new IllegalStateException("Stored grading proposal is not valid JSON", exception);
        }
    }

    private static List<String> readStrings(String json) {
        try {
            return List.of(JSON_MAPPER.readValue(json, String[].class));
        } catch (Exception exception) {
            throw new IllegalStateException("Stored assessment objectives are not valid JSON", exception);
        }
    }

    private static List<RubricCriterion> readCriteria(String json) {
        try {
            return List.of(JSON_MAPPER.readValue(json, RubricCriterion[].class));
        } catch (Exception exception) {
            throw new IllegalStateException("Stored rubric criteria are not valid JSON", exception);
        }
    }

    private record GradingContextHeader(
            UUID assessmentId,
            UUID submissionId,
            UUID rubricVersionId,
            String assessmentTitle,
            String assessmentContext,
            String assessmentInstructions,
            List<String> objectives,
            BigDecimal totalPoints,
            List<RubricCriterion> criteria,
            String learnerLabel) {
    }

    private UUID lockCurrentRevision(UUID assessmentId, String teacherUid) {
        assertAssessmentOwner(assessmentId, teacherUid);
        return jdbc.queryForObject("""
                SELECT current_revision_id
                FROM assessments
                WHERE id = ? AND teacher_uid = ?
                FOR UPDATE
                """, UUID.class, assessmentId, teacherUid);
    }

    private void assertAssessmentOwner(UUID assessmentId, String teacherUid) {
        Integer count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM assessments WHERE id = ? AND teacher_uid = ?",
                Integer.class,
                assessmentId,
                teacherUid);
        if (count == null || count == 0) {
            throw new ResourceNotFoundException(assessmentId.toString());
        }
    }

    private RubricView findRubric(UUID rubricId, UUID assessmentId, String teacherUid) {
        try {
            return jdbc.queryForObject("""
                    SELECT r.*
                    FROM assessment_rubric_versions r
                    JOIN assessments a ON a.id = r.assessment_id
                    WHERE r.id = ? AND r.assessment_id = ? AND a.teacher_uid = ?
                    """, RUBRIC_MAPPER, rubricId, assessmentId, teacherUid);
        } catch (EmptyResultDataAccessException exception) {
            throw new ResourceNotFoundException(rubricId.toString());
        }
    }

    private String writeJson(Object value) {
        try {
            return jsonMapper.writeValueAsString(value);
        } catch (Exception exception) {
            throw new IllegalStateException("Could not serialize evaluation data", exception);
        }
    }

    private static RubricView mapRubric(ResultSet rs) throws SQLException {
        RubricCriterion[] criteria;
        try {
            criteria = JSON_MAPPER.readValue(rs.getString("criteria"), RubricCriterion[].class);
        } catch (Exception exception) {
            throw new SQLException("Stored rubric criteria are not valid JSON", exception);
        }
        return new RubricView(
                rs.getObject("id", UUID.class),
                rs.getObject("assessment_id", UUID.class),
                rs.getObject("assessment_revision_id", UUID.class),
                rs.getInt("version_number"),
                rs.getString("title"),
                rs.getBigDecimal("total_points"),
                rs.getString("status"),
                List.of(criteria),
                rs.getString("created_by"),
                rs.getString("approved_by"),
                instant(rs.getTimestamp("created_at")),
                instant(rs.getTimestamp("approved_at")));
    }

    private static final JsonMapper JSON_MAPPER = JsonMapper.builder().build();

    private static java.time.Instant instant(Timestamp timestamp) {
        return timestamp == null ? null : timestamp.toInstant();
    }

    private record BatchHeader(
            UUID id, UUID assessmentId, String filename, String status,
            int totalFiles, int totalSubmissions, java.time.Instant createdAt) {
    }

    private record SubmissionHeader(UUID id, String learnerLabel, String sourceDirectory, String status) {
    }
}
