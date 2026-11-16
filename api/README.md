```
 ██████╗ ██████╗  █████╗ ██████╗ ███████╗ ██████╗ ██████╗ ███████╗    █████╗ ██╗
██╔════╝ ██╔══██╗██╔══██╗██╔══██╗██╔════╝██╔═══██╗██╔══██╗██╔════╝   ██╔══██╗██║
██║  ███╗██████╔╝███████║██║  ██║█████╗  ██║   ██║██████╔╝███████╗   ███████║██║
██║   ██║██╔══██╗██╔══██║██║  ██║██╔══╝  ██║   ██║██╔═══╝ ╚════██║   ██╔══██║██║
╚██████╔╝██║  ██║██║  ██║██████╔╝███████╗╚██████╔╝██║     ███████║██╗██║  ██║██║
 ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ ╚══════╝ ╚═════╝ ╚═╝     ╚══════╝╚═╝╚═╝  ╚═╝╚═╝
```

<div align="center">

**AI-Native Assessment Operations Platform**

`grade-ops-ai-api` · Domain API

![Build](https://img.shields.io/badge/build-passing-brightgreen?style=flat-square)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.1.0-6DB33F?style=flat-square&logo=springboot&logoColor=white)
![Java](https://img.shields.io/badge/Java-21-ED8B00?style=flat-square&logo=openjdk&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Firebase Admin](https://img.shields.io/badge/Firebase_Admin-9.3-FFCA28?style=flat-square&logo=firebase&logoColor=black)
![Flyway](https://img.shields.io/badge/Flyway-migrations-CC0200?style=flat-square&logo=flyway&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)

</div>

---

## Overview

`grade-ops-ai-api` is the only backend application and owns all business logic, workflow state, persistence, authorization and audit. The Spring AI capabilities in the sibling `agents/` module execute in-process behind typed application ports; they do not run as a second service, make loopback HTTP calls or persist domain state.

Built as a **Spring Boot 4 modular monolith** on Java 21, the backend exposes:
- **Public API** — consumed by the Next.js frontend via Firebase ID token authentication.
- **Operator-only internal API** (`/internal/*`) — protected by the backend's internal shared-secret filter and never exposed to the browser.
- **In-process AI capabilities** — Spring AI agents are invoked through application interfaces; there is no agent HTTP endpoint in the P0 runtime.

---

## Architecture

```
Next.js Web  ─── Bearer <firebase_id_token> ───►  Spring Boot backend
                                                  ├── Public API / domain workflows
                                                  ├── PostgreSQL persistence / Flyway
                                                  └── In-process Spring AI module
                                                        ├── Gemini / Groq adapters
                                                        └── Versioned prompts + typed results
```

The `agents/` Maven module is packaged as a library dependency of `api/`. It is invoked in-process through typed application contracts. The API owns durable AI operation/attempt records, domain state, transaction boundaries and teacher approval. There is no second agent server, loopback HTTP call or independent agent deployment in the P0 architecture.

**Filter chain responsibilities:**

| Filter | Path | Responsibility |
|--------|------|---------------|
| `InternalAuthFilter` | `/internal/**` | Validates the operator shared-secret header; rejects with 403 if missing or wrong |
| `FirebaseTokenFilter` | `/api/**` | Verifies Firebase ID token via Admin SDK and populates the authenticated teacher principal |
| `EmailVerifiedFilter` | `/api/**` | Blocks unverified accounts before they reach protected endpoints |

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Spring Boot (Web MVC) | 4.1.0 |\n| AI runtime | Spring AI | 2.0.0 |
| Language | Java | 21 |
| Security | Spring Security | (Boot-managed) |
| Auth | Firebase Admin SDK | 9.3.0 |
| Persistence | Spring Data JPA + Hibernate | (Boot-managed) |
| Database | PostgreSQL | 15+ |
| Migrations | Flyway | (Boot-managed) |
| Testing | JUnit 5 + Mockito + H2 | (Boot-managed) |
| Logging | Logback + logstash-logback-encoder (JSON) | — |
| Containerization | Docker (multi-stage) | — |
| Runtime target | Cloud Run (JRE 21 Jammy) | — |

---

## Project Structure

```
api/
├── src/
│   ├── main/
│   │   ├── java/cl/gradeops/ai/api/
│   │   │   ├── GradeOpsApiApplication.java
│   │   │   ├── auth/                          # Public auth endpoints
│   │   │   │   ├── AuthController.java        # POST /auth/register, POST /auth/sign-out
│   │   │   │   ├── AuthService.java
│   │   │   │   ├── RegisterRequest.java
│   │   │   │   ├── RegisterResponse.java
│   │   │   │   └── InvalidTokenException.java
│   │   │   ├── assessment/                    # Assessment listing
│   │   │   │   ├── AssessmentController.java  # GET /assessments
│   │   │   │   ├── AssessmentService.java
│   │   │   │   ├── AssessmentStatus.java
│   │   │   │   └── AssessmentSummaryDto.java
│   │   │   ├── domain/
│   │   │   │   └── teacher/
│   │   │   │       ├── TeacherEntity.java     # JPA entity — teacher table
│   │   │   │       └── TeacherRepository.java
│   │   │   ├── internal/
│   │   │   │   └── teacher/                   # Operator-only endpoints
│   │   │   │       ├── InternalTeacherController.java  # POST /internal/teachers, PATCH /internal/teachers/{uid}/flags
│   │   │   │       ├── ProvisionTeacherService.java
│   │   │   │       ├── ProvisionTeacherRequest.java
│   │   │   │       ├── ProvisionTeacherResponse.java
│   │   │   │       ├── PilotFlagService.java
│   │   │   │       ├── PilotFlagRequest.java
│   │   │   │       └── PilotFlagResponse.java
│   │   │   ├── security/
│   │   │   │   ├── SecurityConfig.java        # Filter chain wiring
│   │   │   │   ├── InternalAuthFilter.java
│   │   │   │   ├── FirebaseTokenFilter.java
│   │   │   │   ├── EmailVerifiedFilter.java
│   │   │   │   ├── AuthenticatedTeacher.java  # Spring Security principal
│   │   │   │   └── OwnershipVerifier.java     # Resource isolation helper
│   │   │   ├── config/
│   │   │   │   └── FirebaseConfig.java        # FirebaseApp bean initialization
│   │   │   └── common/
│   │   │       ├── GlobalExceptionHandler.java
│   │   │       ├── ResourceNotFoundException.java  # → 404
│   │   │       └── DuplicateEmailException.java    # → 409
│   │   └── resources/
│   │       ├── application.yml
│   │       ├── logback-spring.xml             # JSON structured logging for Cloud Logging
│   │       └── db/migration/
│   │           ├── V1__create_teacher_table.sql
│   │           └── V2__add_pilot_flag_columns.sql
│   └── test/
│       └── java/cl/gradeops/ai/api/
│           ├── auth/AuthControllerTest.java
│           ├── assessment/AssessmentControllerTest.java
│           ├── domain/teacher/TeacherRepositoryTest.java
│           ├── internal/teacher/ProvisionTeacherControllerTest.java
│           ├── internal/teacher/PilotFlagControllerTest.java
│           ├── security/FirebaseTokenFilterTest.java
│           ├── security/EmailVerifiedFilterTest.java
│           ├── security/OwnershipVerifierTest.java
│           └── config/FirebaseTestConfig.java
├── Dockerfile
├── pom.xml
└── mvnw
```

---

## Getting Started

### Prerequisites

| Tool | Minimum version |
|------|----------------|
| Java (JDK) | 21 |
| Maven (or use `./mvnw`) | 3.9 |
| PostgreSQL | 15 |
| Firebase project (for token validation) | — |

### Environment Variables

The backend is configured via `api/src/main/resources/application*.yml` with environment variable overrides. Set the following before starting:

```bash
# Database
DATABASE_URL=jdbc:postgresql://localhost:5432/gradeops
DATABASE_USER=gradeops
DATABASE_PASSWORD=gradeops

# Internal API — operator-only shared secret
INTERNAL_API_SECRET=change-me-in-development
GRADEOPS_DEFAULT_PROVIDER=groq
GRADEOPS_GROQ_API_KEY=...
GRADEOPS_GROQ_MODEL=llama-3.3-70b-versatile
GRADEOPS_GEMINI_API_KEY=...
GRADEOPS_GEMINI_MODEL=gemini-2.0-flash

# Firebase Admin SDK — path to service account JSON key file
GOOGLE_APPLICATION_CREDENTIALS=/path/to/firebase-adminsdk.json
```

For local development, copy `src/main/resources/application-local.example.yml` to `src/main/resources/application-local.yml` (gitignored), update the paths and credentials, and activate the profile with `-Dspring.profiles.active=local`.

### Database Setup

```bash
# Create the database (first time only)
createdb gradeops

# Migrations run automatically on startup via Flyway.
# To run manually:
./mvnw flyway:migrate
```

### Local Development

```bash
./mvnw spring-boot:run
# or with the local profile:
./mvnw spring-boot:run -Dspring.profiles.active=local
```

The backend starts on **http://localhost:8080**. From the repository root, install the capability module and run the single API application:

```bash
./api/mvnw -f pom.xml -pl api -am -Pbeta spring-boot:run
```

---

## Available Commands

| Command | Description |
|---------|-------------|
| `./mvnw spring-boot:run` | Start the API server |
| `./mvnw spring-boot:run -Dspring.profiles.active=local` | Start with local profile |
| `./mvnw test` | Run the full test suite |
| `./mvnw test -Dtest=ClassName` | Run a single test class |
| `./mvnw test -Dtest=ClassName#methodName` | Run a single test method |
| `./mvnw package -DskipTests` | Build the JAR |
| `./mvnw flyway:migrate` | Run pending DB migrations manually |

---

## API Reference

### Public Endpoints (`/api/**`)

All public endpoints require a valid Firebase ID token in the `Authorization: Bearer <token>` header and a verified email address.

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/auth/register` | Register a new teacher account (creates Firebase user + DB record) |
| `POST` | `/auth/sign-out` | Invalidate the server-side session; client must discard the token |
| `GET` | `/assessments` | List all assessments for the authenticated teacher |
| `POST` | `/assessments/{id}/rubrics` | Create a rubric draft |
| `GET` | `/assessments/{id}/rubrics` | List rubric versions |
| `PUT` | `/assessments/{id}/rubrics/{rubricId}` | Edit a rubric draft |
| `POST` | `/assessments/{id}/rubrics/{rubricId}/approve` | Approve an immutable rubric version |
| `POST` | `/assessments/{id}/submission-batches` | Upload a ZIP of student projects (multipart `file`) |
| `GET` | `/assessments/{id}/submission-batches` | List received batches |
| `GET` | `/submission-batches/{batchId}` | Read batch and submissions |
| `GET` | `/submissions/{submissionId}/evidence` | Inspect inventoried files and extracted text |
| `POST` | `/submissions/{submissionId}/grading-runs` | Generate an evidence-backed AI proposal |
| `GET` | `/submissions/{submissionId}/latest-review` | Recover latest teacher review |
| `GET` | `/grading-runs/{runId}/review` | Read proposal and teacher edits |
| `PUT` | `/grading-runs/{runId}/review` | Save teacher edits |
| `POST` | `/grading-runs/{runId}/approve` | Explicitly approve the result |
| `GET` | `/assessments/{id}/approved-results/export` | Export approved results as CSV |

### Internal Endpoints (`/internal/**`)

Internal endpoints require the `X-Internal-Secret` header with the value of `INTERNAL_API_SECRET`. These are never exposed to the browser.

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/internal/teachers` | Provision a teacher account (operator-initiated, bypasses self-registration) |
| `PATCH` | `/internal/teachers/{uid}/flags` | Set pilot/free/paid plan flag and evidence metadata |

---

## Security Model

- **Workspace isolation.** `OwnershipVerifier` is injected into any service that returns teacher-scoped resources. It throws `ResourceNotFoundException` (404) on cross-teacher access — intentionally 404, not 403, to avoid leaking resource existence.
- **No credentials stored.** The API validates Firebase ID tokens but never stores passwords or raw tokens. The Firebase UID is the teacher's primary key.
- **Internal surface locked down.** `/internal/**` is unreachable without the correct `X-Internal-Secret`. Do not expose port 8080 publicly in production — traffic must come through the load balancer, which strips the header before forwarding to the public surface.
- **Structured JSON logs.** All logs are emitted as JSON via `logstash-logback-encoder`, compatible with Cloud Logging's structured log ingestion.

---

## Database Schema

Managed by Flyway. Migrations live in `src/main/resources/db/migration/`.

| Migration | Description |
|-----------|-------------|
| `V1__create_teacher_table.sql` | `teacher` table with `firebase_uid` as PK and unique email index |
| `V2__add_pilot_flag_columns.sql` | `plan_type`, `related_party`, `offer_details`, `evidence_link`, `flag_set_by`, `flag_set_at` |
| `V18__add_rubrics_and_submission_intake.sql` | Rubric versions, ZIP batches, submissions, file evidence, grading runs, teacher reviews and audit events |

---

## Docker

```bash
# Run from the repository root because the Dockerfile builds the api + agents reactor
docker build -f api/Dockerfile -t grade-ops-api .

docker run -p 8080:8080 \
  -e DATABASE_URL=jdbc:postgresql://host.docker.internal:5432/gradeops \
  -e DATABASE_USER=gradeops \
  -e DATABASE_PASSWORD=gradeops \
  -e INTERNAL_API_SECRET=dev-secret \
  -e GOOGLE_APPLICATION_CREDENTIALS=/creds/firebase.json \
  -v /path/to/firebase.json:/creds/firebase.json:ro \
  grade-ops-api
```

---

## P0 code-review workflow

The teacher-facing code-review flow is implemented as a vertical slice:

1. Create or edit a rubric draft; criterion maxima must sum to the total.
2. Approve the rubric version. Approved versions are immutable and tied to an assessment revision.
3. Upload a ZIP. Intake is streaming and bounded (25 MB compressed, 500 entries, 100 MB expanded, 512 KB per extracted text file by default).
4. ZIP paths are normalized and traversal/duplicate paths rejected. The intake never writes extracted files to disk and never executes student code.
5. Supported text files are hashed and stored as evidence. Binary, unsupported and oversized files are inventoried but not sent to the grading model.
6. The in-process grading capability returns a proposal per criterion with score, rationale, file/line references and uncertainty. Invalid or fabricated evidence references reject the proposal.
7. The teacher edits and saves the result, then explicitly approves it. A later approval supersedes the previous approved result without deleting history.
8. Only approved results are included in the CSV export. Approval does not publish grades to students.

Useful endpoints are listed in the Public API table above. Upload limits are configurable with `GRADEOPS_MAX_ARCHIVE_BYTES`, `GRADEOPS_MAX_ARCHIVE_ENTRIES`, `GRADEOPS_MAX_UNCOMPRESSED_BYTES` and `GRADEOPS_MAX_TEXT_FILE_BYTES`.

The backend is one Spring Boot deployable. The sibling `agents/` Maven module is included in-process; it is not started separately and does not expose an internal HTTP server. See [ADR-018](../docs/99-decisions/2026-11-16-p0-teacher-demo-modular-monolith.md).

## Related Modules and Repositories

| Path | Responsibility |
|------|-------------|
| [`../web/`](../web/) | Next.js teacher workspace — API consumer |
| [`../agents/`](../agents/) | In-process Spring AI capability module — no independent deployment |
| [`../infra/`](../infra/) | Terraform — GCP infrastructure provisioning |
| [`../docs/`](../docs/) | Canonical product and architecture documentation |
