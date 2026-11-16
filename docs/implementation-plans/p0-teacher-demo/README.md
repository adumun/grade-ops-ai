# P0 Teacher Demo — Delivery Plan

- Parent: [ADU-182](https://adumun.atlassian.net/browse/ADU-182)
- GitHub execution: [Issue #120](https://github.com/adumun/grade-ops-ai/issues/120)
- Branch: `feat/ADU-182-gh120-teacher-demo`
- Target: deployed, end-to-end teacher demo by 2026-11-20; stabilization buffer through 2026-11-24; Start-Up Chile application readiness by 2026-11-25.
- Priority: P0 — all other GradeOps work is subordinate unless it unblocks this slice.

## Delivery principle

Build a complete vertical path, not a set of disconnected screens. Reuse accepted product/domain contracts and the existing GradeOps UI system. Change implementation strategy where necessary. A feature is not done until it is integrated, tested and visible in the teacher journey.

## Vertical increments

### V0 — Consolidated backend and demo foundation

- Establish the single deployable Spring Boot modular monolith.
- Keep PostgreSQL/Flyway, Firebase Auth and existing assessment authoring lifecycle.
- Integrate Spring AI runtime in-process; remove the API-to-agent-service network hop from the P0 path.
- Preserve provider adapters and execution evidence.
- Establish synthetic teacher, assessment and learner dataset for repeatable demo.

**Gate:** one backend process owns API, domain and agent execution; startup, health and persistence are reproducible.

### V1 — Assessment and rubric readiness

- Reuse current assessment brief generation and immutable revision workflow.
- Add rubric draft generation or bounded rubric proposal based on the accepted rubric contract.
- Allow teacher editing and explicit approval of a versioned rubric.
- Persist rubric version and block grading until approved.

**Gate:** an approved, inspectable rubric exists before any grading run.

### V2 — ZIP intake and evidence preparation

- Upload a ZIP of learner projects.
- Validate archive size, entry count, path traversal, symlinks and decompression limits.
- Inventory learners/submissions/files; classify source, config, documentation, binary and unsupported content.
- Extract text safely and produce stable evidence references (file path + line range where available).
- Never execute student code.

**Gate:** heterogeneous project structures are ingested without unsafe extraction; teacher can inspect the prepared evidence.

### V3 — Bounded AI review

- Implement a typed Grading Agent contract based on `docs/03-ai-agents/grading-agent.md`.
- Send only the approved assessment/rubric snapshot and prepared evidence.
- Return per-criterion suggested score, evidence references, rationale, uncertainty flags and teacher-review recommendation.
- Persist the original proposal and complete execution metadata before exposing it to the UI.
- Keep provider/model/prompt versions explicit and configurable.

**Gate:** every suggestion is traceable to rubric criteria and actual extracted evidence; no autonomous final grade.

### V4 — Teacher review, approval and export

- Reuse the existing operations inbox and assessment-evidence UX patterns where they fit.
- Provide a premium, responsive workspace: submission list, file/evidence viewer, criterion-level proposal, uncertainty, teacher edits and clear decision states.
- Record review and approval events separately.
- Export teacher-approved results/feedback in a practical CSV/XLSX format.

**Gate:** a teacher can review, edit, approve and export without prompts, CLI commands or manual agent orchestration.

### V5 — Release and validation

- Automated unit/integration tests for archive safety, rubric approval gate, agent contracts, evidence references and approval invariants.
- End-to-end smoke using synthetic data.
- Verify responsive layouts and accessibility basics.
- Deploy one backend and the teacher frontend; verify health, auth/demo access, upload, AI execution, persistence and export.
- Capture demo evidence and known limitations.

**Gate:** a repeatable demo works from a clean start and can be shown to DUOC teachers.

## Schedule and stop conditions

| Date | Expected outcome |
|---|---|
| Nov 16 | P0 architecture locked; repo and execution branch ready; first backend consolidation increment |
| Nov 17 | Rubric approval + ZIP ingestion path |
| Nov 18 | AI grading + evidence persistence |
| Nov 19 | Teacher review UI + export + integration |
| Nov 20 | Deploy, end-to-end QA and teacher-demo candidate |
| Nov 21–24 | Buffer for defects, UX adjustments and demo reliability |
| Nov 25 | Start-Up Chile application package ready |

If a gate slips, cut breadth before cutting safety, teacher approval, evidence traceability or end-to-end completeness. Prefer one supported programming-language/project path plus robust unsupported-file handling over pretending to support every language.

## Explicitly deferred

- Full transversal product roadmap.
- Separate agent service deployment.
- General-purpose code execution or sandbox.
- Student-facing publication.
- Additional agents beyond rubric and grading needs.
- Broad analytics, billing and institutional administration.
