CREATE TABLE assessment_rubric_versions (
    id UUID PRIMARY KEY,
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    assessment_revision_id UUID NOT NULL REFERENCES assessment_revisions(id),
    version_number INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    total_points NUMERIC(8,2) NOT NULL CHECK (total_points > 0),
    criteria JSONB NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('DRAFT', 'APPROVED', 'SUPERSEDED')),
    created_by VARCHAR NOT NULL,
    approved_by VARCHAR,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    approved_at TIMESTAMPTZ,
    UNIQUE (assessment_id, version_number)
);

CREATE INDEX idx_rubric_versions_assessment ON assessment_rubric_versions(assessment_id, version_number DESC);
CREATE INDEX idx_rubric_versions_current_approved
    ON assessment_rubric_versions(assessment_id, assessment_revision_id, status);

CREATE TABLE submission_batches (
    id UUID PRIMARY KEY,
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    original_filename VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('READY', 'FAILED')),
    total_files INTEGER NOT NULL DEFAULT 0,
    total_submissions INTEGER NOT NULL DEFAULT 0,
    uploaded_by VARCHAR NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_submission_batches_assessment ON submission_batches(assessment_id, created_at DESC);

CREATE TABLE submissions (
    id UUID PRIMARY KEY,
    batch_id UUID NOT NULL REFERENCES submission_batches(id) ON DELETE CASCADE,
    learner_label VARCHAR(200) NOT NULL,
    source_directory VARCHAR(500) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'READY' CHECK (status IN ('READY', 'GRADED', 'REVIEWED', 'APPROVED')),
    file_count INTEGER NOT NULL DEFAULT 0,
    text_file_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (batch_id, source_directory)
);

CREATE INDEX idx_submissions_batch ON submissions(batch_id);

CREATE TABLE submission_files (
    id UUID PRIMARY KEY,
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    relative_path VARCHAR(1000) NOT NULL,
    media_type VARCHAR(120) NOT NULL,
    size_bytes BIGINT NOT NULL CHECK (size_bytes >= 0),
    sha256 CHAR(64) NOT NULL,
    classification VARCHAR(20) NOT NULL CHECK (classification IN ('TEXT', 'BINARY', 'UNSUPPORTED', 'OVERSIZED')),
    extracted_text TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (submission_id, relative_path)
);

CREATE INDEX idx_submission_files_submission ON submission_files(submission_id, relative_path);

CREATE TABLE grading_runs (
    id UUID PRIMARY KEY,
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    rubric_version_id UUID NOT NULL REFERENCES assessment_rubric_versions(id),
    status VARCHAR(20) NOT NULL CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED')),
    proposal JSONB,
    provider VARCHAR(80),
    model VARCHAR(160),
    prompt_version VARCHAR(120),
    input_hash CHAR(64),
    output_hash CHAR(64),
    estimated_input_tokens INTEGER,
    estimated_output_tokens INTEGER,
    cost_estimate DOUBLE PRECISION,
    error_code VARCHAR(100),
    started_at TIMESTAMPTZ NOT NULL,
    finished_at TIMESTAMPTZ
);

CREATE INDEX idx_grading_runs_submission ON grading_runs(submission_id, started_at DESC);
CREATE INDEX idx_grading_runs_assessment ON grading_runs(assessment_id, started_at DESC);

CREATE TABLE grading_reviews (
    id UUID PRIMARY KEY,
    grading_run_id UUID NOT NULL UNIQUE REFERENCES grading_runs(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('DRAFT', 'APPROVED', 'SUPERSEDED')),
    edited_result JSONB NOT NULL,
    final_score NUMERIC(8,2),
    teacher_comment TEXT,
    approved_by VARCHAR,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    approved_at TIMESTAMPTZ
);

CREATE TABLE grading_review_events (
    id UUID PRIMARY KEY,
    review_id UUID NOT NULL REFERENCES grading_reviews(id) ON DELETE CASCADE,
    actor_uid VARCHAR NOT NULL,
    event_type VARCHAR(40) NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_grading_review_events_review ON grading_review_events(review_id, created_at);
