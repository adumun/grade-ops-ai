# ADR-018 — P0 teacher demo as a modular-monolith backend

- **Status:** Accepted
- **Date:** 2026-11-16
- **Decision owner:** GradeOps AI product/engineering
- **Scope:** P0 teacher demo for the Startup Chile application and early DUOC educator validation

## Context

The earlier backend design separated the domain API and the Spring AI agent runtime into independently deployed services. That separation created an HTTP boundary, another deployment target, duplicated local orchestration and extra configuration before the product has evidence that the boundary provides value.

The immediate product goal is a short, dependable teacher journey for reviewing programming submissions. The demo must preserve the existing GradeOps AI principles: AI proposes, the teacher decides; rubric versions are explicit; evidence and uncertainty remain visible; approved decisions are auditable.

## Decision

For the P0 demo, deploy **one Spring Boot backend application** as a modular monolith.

- `api/` is the only Spring Boot application and the only backend deployable.
- `agents/` is a Maven library module compiled into the API application. It contains typed use cases, prompts and Spring AI provider adapters; it does not expose a separate server or own durable domain state.
- The API invokes agent use cases in-process through typed ports/adapters. No loopback HTTP calls or internal agent REST API are used in the P0 runtime.
- The API owns authentication, authorization, database transactions, assessment/rubric/submission state, AI operation records, teacher review and approval.
- Agent modules receive bounded commands and return typed proposals plus execution evidence. They never persist domain entities, execute student code, approve a rubric, finalize a grade or publish results.
- Provider credentials remain server-side. Gemini and Groq remain supported through Spring AI.
- The web workspace remains Next.js/React and consumes the API. Its teacher experience is a first-class product requirement, not a visual afterthought.

## P0 teacher journey

1. Create or review an assessment brief.
2. Define and approve an immutable rubric version.
3. Upload a ZIP containing one or more student projects.
4. Inventory and safely extract supported text evidence without writing extracted files to disk or executing student code.
5. Request a grading proposal for each submission, with criterion-level scores, rationale, evidence references and uncertainty.
6. Let the teacher edit and save the proposal, then explicitly approve it.
7. Export only teacher-approved results as CSV.

No student-facing publication is implied by approval in this demo.

## Safety and integrity constraints

- ZIP intake enforces compressed size, entry count, expanded size, per-file size, path traversal and duplicate-path limits.
- Binary, unsupported and oversized files are inventoried but not sent to the model as source text.
- The grading agent receives only extracted text and a frozen approved rubric.
- Evidence references must resolve to a submitted text file, valid 1-based line range and matching excerpt. Invalid references reject the proposal.
- Missing evidence is surfaced as uncertainty/review flags, not silently treated as proof of failure.
- Teacher edits are checked against the immutable rubric and submitted evidence on the server.
- Every AI run stores provider/model/prompt version, input/output hashes, token estimates, cost estimate, status and timestamps.
- Re-approval supersedes the previous approved result for that submission while preserving its review history.

## Consequences

### Positive

- One backend deployment, one runtime health surface and simpler local development.
- No service-to-service credentials, retries, network timeouts or distributed tracing needed between API and agent runtime.
- The module boundary remains explicit and can be extracted later if operational evidence justifies it.
- The teacher approval boundary and auditability remain intact.

### Trade-offs

- API and agent modules share one process and release cadence for P0.
- Provider libraries increase the API artifact size.
- In-process agent calls are synchronous in the initial demo; long-running orchestration/queueing can be introduced only when measured latency and concurrency justify it.

## Revisit criteria

Reconsider a separately deployed agent runtime only when there is demonstrated need for independent scaling, fault isolation, separate release cadence, heterogeneous compute, or a measured operational bottleneck. Do not extract services pre-emptively.

## Supersession

This decision supersedes the earlier P0 assumption that `agents/` must run as an independently deployed service. Historical diagrams and ADRs remain as decision history; this ADR governs the teacher demo.
