<a id="top"></a>

# Assessment authoring preview

Local teacher authoring screens. Models and localStorage records are preview artifacts, not backend contracts. Parent Work Items are WEBUI-007 for resources/objectives and WEBUI-009 for authoring; the historical WEBUI-004 branch label does not redefine review/approval.

## Direct files

| File | Responsibility |
| --- | --- |
| [AssessmentAuthoringPage.module.css](AssessmentAuthoringPage.module.css) | Styles and layout: Assessment Authoring Page. |
| [AssessmentListPage.tsx](AssessmentListPage.tsx) | Authoring implementation: Assessment List Page. |
| [AssessmentPurposePage.tsx](AssessmentPurposePage.tsx) | Authoring implementation: Assessment Purpose Page. |
| [ContentSetPage.tsx](ContentSetPage.tsx) | Authoring implementation: Content Set Page. |
| [ObjectiveSetPage.tsx](ObjectiveSetPage.tsx) | Authoring implementation: Objective Set Page. |
| [RubricPage.tsx](RubricPage.tsx) | Authoring implementation: Rubric Page. |

## Subfolders

- [components](components/README.md) — Presentational sections and controls composing the existing shell and design system.
- [data](data/README.md) — Preview adapters and fixtures. ContentSets and rubric versions use schemaVersion 1 collections with a separate currentId. Legacy single-object values remain readable; only the next successful write upgrades the key. Reset is explicit.
- [domain](domain/README.md) — Readiness, coverage, local types and validation. localIdentity uses Web Crypto randomness rather than array size. Existing IDs and links remain unchanged on edit; this is not a backend ID policy.
- [hooks](hooks/README.md) — Orchestration of editable local drafts, loading and saving. No API or model-provider integration is introduced by recovery.

## Recovery validation

Refs [Issue #115](https://github.com/adumun/grade-ops-ai/issues/115). From repository root: `make lint`, `make test`, `make typecheck`, `make build WEB_PROFILE=local-preview`. Browser smoke is separate and requires the documented Chrome channel. This repair does not establish backend integration, visual acceptance or production readiness.

---

[← Parent](../../../README.md) · [Next →](AssessmentAuthoringPage.module.css) · [↑ Top](#top)
