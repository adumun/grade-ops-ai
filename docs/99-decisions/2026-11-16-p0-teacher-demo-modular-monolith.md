# GradeOps AI — P0 Teacher Demo: Modular Monolith and Delivery Cut

- Status: Accepted
- Date: 2026-11-16
- Decision owner: Product / Architecture
- Supersedes: the deployment-topology choice in [Agent Runtime Separation](2026-06-10-agent-runtime-separation.md) for the P0 teacher-demo slice. The agent responsibility boundaries and typed contracts remain valid.

## Context

The 2026-11-16 priority reset makes the GradeOps AI teacher demo the highest-priority ADÜMÜN initiative. The first validation audience is programming teachers, especially those who spend substantial time reviewing heterogeneous code submissions and adapting imperfect statements or rubrics.

The repository already contains:
- a Spring Boot 4 / Java 21 API with assessment authoring, immutable revisions, durable AI operation/attempt records, Firebase authentication and PostgreSQL persistence;
- a Spring AI assessment-agent implementation with Gemini and Groq provider adapters and versioned prompt resources;
- a Next.js App Router / React / TypeScript teacher workspace, a reusable design system and a visually mature operations/review preview;
- an accepted behavioral reference relationship with `academic-grading-with-ai`.

A separately deployed agent service adds operational and deployment coordination that is not justified for this demo window. It would slow down the first complete teacher journey without creating a user-visible advantage.

## Decision

For the P0 teacher-demo release, GradeOps AI uses **one deployable backend modular monolith**:

- Spring Boot 4, Java 21 and PostgreSQL.
- Existing API remains the application entry point and sole owner of domain state, authorization, persistence, workflows, audit and approval.
- Spring AI agent capabilities execute in-process behind explicit application ports/adapters and remain isolated in internal modules/packages.
- Provider adapters, prompt templates, structured output contracts, execution evidence and bounded orchestration are retained. Agent code must not own domain persistence or final academic decisions.
- No loopback HTTP, internal REST hop, second Cloud Run service, queue or microservice is introduced for the P0 path.
- Existing agent-runtime code is migrated or integrated into the backend build in a maintainable way; do not use source-directory hacks or duplicate application bootstraps.

Frontend:
- Next.js App Router, React, TypeScript and Tailwind CSS 4.
- Upgrade to current stable compatible releases, not canary/pre-release versions.
- Preserve and elevate the existing GradeOps design system, UX decisions, accessibility and interaction conventions. Visual quality is a release criterion, not a post-demo polish task.
- Firebase Auth remains the identity provider unless the current demo flow has a concrete blocker.

## P0 teacher journey

1. Teacher starts from a plain-language programming assessment brief and optional source documents.
2. GradeOps drafts the assessment and proposes an editable rubric with observable criteria, weights, performance guidance and evidence to inspect.
3. Teacher reviews and approves the rubric version. Grading is blocked until this approval exists.
4. Teacher uploads a ZIP containing heterogeneous learner projects. The system inventories files, detects project/language structure where possible, extracts safe textual evidence and records unsupported/binary/oversized items without executing student code.
5. A bounded grading agent receives the approved assessment/rubric snapshot and prepared evidence. It returns structured criterion-level suggestions with evidence references, rationale, uncertainty and review flags.
6. Teacher reviews, edits, accepts or rejects each suggestion and can inspect source evidence.
7. Explicit teacher approval records the official reviewed result and enables an export of results/feedback. Approval and publication remain distinct; no student-facing publication is part of this demo unless separately authorized.

## Non-negotiable invariants

- AI output is always a proposal until a teacher explicitly approves it.
- The grading agent cannot create or mutate the approved rubric.
- Grading cannot run against a draft or changed rubric; the exact approved rubric version is recorded with every run.
- Evidence references must resolve to extracted files/locations. Never fabricate line numbers or claim code was executed.
- Student code is never executed in the P0 review pipeline.
- Missing or unsupported evidence increases uncertainty; it is not interpreted as zero achievement.
- Teacher edits and decisions are attributable and auditable; the original AI proposal remains available.
- Provider, model, prompt/contract version, latency, available token/cost data, status and errors are recorded for each AI operation.
- Demo data is synthetic and clearly identified.

## Scope discipline

In scope: one programming-assessment workflow, rubric proposal/edit/approval, ZIP intake and inventory, bounded AI code review, evidence-aware teacher review/edit/approval, export, demo seed data, responsive polished UX, tests and deployed demo.

Out of scope: full LMS, student portal, multi-institution administration, billing, generic workflow engine, autonomous grading/publication, code execution/sandbox, plagiarism verdicts, broad analytics, and additional model providers without a concrete need.

## Consequences

- The earlier ADR's rationale for a separate service remains useful for future scale/failure isolation, but the temporary one-deployable option is now the selected P0 topology.
- A future extraction of the agent module remains possible because contracts and boundaries are preserved.
- Product/domain definitions are reused. Implementation and delivery topology change; product semantics do not.
- The first release is optimized for a complete, credible teacher journey and user feedback, not broad feature count.
