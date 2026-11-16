package cl.gradeops.ai.api.evaluation.infrastructure.adapter.out.persistence;

import cl.gradeops.ai.api.evaluation.application.command.CreateRubricDraftCommand;
import cl.gradeops.ai.api.evaluation.application.exception.EvaluationConflictException;
import cl.gradeops.ai.api.evaluation.application.model.RubricCriterion;
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
                SELECT s.id, s.learner_label, s.source_directory, s.status, s.file_count, s.text_file_count
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
                        rs.getInt("text_file_count")),
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
