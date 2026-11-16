# P0 — Teacher demo delivery plan

**Decision date:** 16 November 2026  
**Product priority:** P0  
**Target:** usable teacher demo by 20 November; stabilization window 21–24 November; Startup Chile application readiness by 25 November.

## Outcome

A programming teacher can move from an assessment brief to a teacher-approved, evidence-backed review of student code without writing prompts or manually orchestrating an AI agent.

## The vertical journey

1. **Assessment ready** — use the existing assessment authoring flow and current revision.
2. **Rubric** — create/edit a versioned rubric, verify criterion maxima add to the total, and explicitly approve it.
3. **Submission intake** — upload one ZIP with student folders or one project; inventory files safely and expose the extracted text evidence.
4. **AI review** — run the grading capability against the frozen assessment revision and approved rubric; receive a score proposal per criterion, rationale, exact file/line evidence and uncertainty.
5. **Teacher review** — inspect files and citations, edit criterion scores/rationale and overall feedback, save changes, then explicitly approve.
6. **Export** — download approved results as CSV. Approval does not publish results to students.

## Delivery sequence

| Date | Focus | Acceptance checkpoint |
|---|---|---|
| 16 Nov | Consolidate backend into one modular monolith; establish rubric/submission schema and teacher workflow contracts | One backend deployable; no agent HTTP hop |
| 17 Nov | Finish safe ZIP intake, rubric lifecycle and recovery of batches | A teacher can approve a rubric and upload a representative ZIP |
| 18 Nov | Integrate grading agent, provider selection, evidence verification and execution trace | One submission receives a bounded proposal with verifiable evidence |
| 19 Nov | Complete teacher edit/approval lifecycle and CSV export; connect React workspace | Full vertical works end-to-end on local demo data |
| 20 Nov | UX polish, realistic demo dataset, accessibility and walkthrough rehearsal | A teacher can complete the journey without CLI/prompts |
| 21–24 Nov | Reserved stabilization window: fix observed defects, validate deploy, improve copy and demo reliability | No critical/high defects; demo and application evidence reproducible |
| 25 Nov | Startup Chile application package ready | Product narrative, working demo, educator feedback and evidence organized |

## P0 scope guard

### Included

- Single teacher workspace, one assessment at a time.
- Versioned rubric with explicit approval.
- ZIP upload, safe inventory and source-text extraction.
- AI-assisted code review against approved rubric.
- Evidence references and uncertainty.
- Human editing, approval and audit events.
- CSV export of approved results.
- Responsive, polished React interface.

### Deferred

- Student accounts, student-facing publication and LMS gradebook synchronization.
- Automated code execution, compilation or test execution in the grading path.
- Plagiarism or AI-authorship detection.
- Multi-tenant administration, billing and institutional integrations.
- Independently deployed agent microservice, queue/orchestrator platform and generalized workflow builder.
- General-purpose document assessment beyond the programming-code use case.

## Validation with DUOC educators

Use the existing teacher network to validate the pain and workflow, not merely collect compliments. For each educator, record:

- Teaching area and approximate number of code submissions per evaluation.
- Current minutes spent reviewing one submission and a full class.
- How often rubrics are incomplete, ambiguous or need interpretation.
- Whether criterion-level evidence and uncertainty are useful.
- Whether they would use the workflow for a real upcoming assessment.
- What they would need before trusting the teacher approval/export step.

Record positive, negative and neutral feedback. Avoid implying institutional endorsement or DUOC procurement interest without explicit permission.

## Quality gates

- Backend and frontend build/test gates pass.
- ZIP safety tests cover traversal, duplicate paths, oversized entries, expansion limits and binary files.
- Grading tests cover score bounds, unknown criteria, invalid file/line references and fabricated excerpts.
- Teacher edit validation uses server-side rubric maxima and actual submission evidence.
- Approval is explicit and append-only history is preserved; a later approval supersedes, not erases, the previous one.
- Demo works without asking the teacher to write or tune prompts.
- No secrets or real student personal data are included in demo fixtures.
