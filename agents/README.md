# GradeOps AI — AI Capability Module

`agents/` is an internal Maven module in the GradeOps AI backend reactor. It is **not a separately deployed service** in the P0 modular-monolith architecture.

## Responsibility

- Execute bounded AI capabilities behind typed application contracts.
- Own provider-specific Spring AI adapters (Gemini and Groq/OpenAI-compatible).
- Keep prompts versioned as classpath resources.
- Validate structured model output and return typed results with execution evidence.
- Never persist domain state, approve rubrics, finalize grades or publish student-facing content.

## Runtime boundary

The only Spring Boot application is `api/`. The API includes this module in its application context and invokes `GenerateAssessmentDraftUseCase` and `GradeSubmissionUseCase` in-process. The API owns transaction boundaries, durable `AiOperation`/`AgentAttempt` records, assessment state and teacher approval.

The module deliberately has no standalone application bootstrap, HTTP server, application configuration file, Docker image or deployment workflow.

## Build

From the repository root:

```bash
./api/mvnw -f pom.xml -pl agents -Pbeta test
./api/mvnw -f pom.xml -pl agents -Pdemo package
```

The Maven profiles provide the Spring AI model starters. The API reactor includes this module in the single backend artifact:

```bash
./api/mvnw -f pom.xml -pl api -am -Pbeta test
```

## Package boundaries

- `assessment/application`: assessment-draft commands, orchestration, results and execution evidence.
- `grading/application`: code-grading commands, rubric criteria, evidence validation and teacher-facing proposal results.
- `shared/application/port/out`: provider-neutral structured-generation contract and provider selector.
- `assessment/infrastructure/adapter/out`: Gemini and Groq structured-generation adapters.
- `assessment/infrastructure/config`: Spring bean wiring and provider selection.
- `src/main/resources/prompts`: versioned assessment and grading prompt templates.

See [the P0 modular-monolith ADR](../docs/99-decisions/2026-11-16-p0-teacher-demo-modular-monolith.md).
