<a id="top"></a>

# Local authoring data

Preview adapters and fixtures. ContentSets and rubric versions use schemaVersion 1 collections with a separate currentId. Legacy single-object values remain readable; only the next successful write upgrades the key. Reset is explicit.

## Direct files

| File | Responsibility |
| --- | --- |
| [assessmentDataSource.ts](assessmentDataSource.ts) | Authoring implementation: assessment Data Source. |
| [contentSetDataSource.ts](contentSetDataSource.ts) | Authoring implementation: content Set Data Source. |
| [fixtureContentSetDataSource.ts](fixtureContentSetDataSource.ts) | Authoring implementation: fixture Content Set Data Source. |
| [fixtureObjectiveDataSource.ts](fixtureObjectiveDataSource.ts) | Authoring implementation: fixture Objective Data Source. |
| [fixtureRubricDataSource.ts](fixtureRubricDataSource.ts) | Authoring implementation: fixture Rubric Data Source. |
| [localAssessmentDataSource.ts](localAssessmentDataSource.ts) | Authoring implementation: local Assessment Data Source. |
| [localContentSetDataSource.ts](localContentSetDataSource.ts) | Authoring implementation: local Content Set Data Source. |
| [localObjectiveDataSource.ts](localObjectiveDataSource.ts) | Authoring implementation: local Objective Data Source. |
| [localRubricDataSource.ts](localRubricDataSource.ts) | Authoring implementation: local Rubric Data Source. |
| [objectiveDataSource.ts](objectiveDataSource.ts) | Authoring implementation: objective Data Source. |
| [rubricDataSource.ts](rubricDataSource.ts) | Authoring implementation: rubric Data Source. |

## Subfolders

- [__tests__](__tests__/README.md) — Resource preservation across subsequent saves, copies and reload reads, with legacy compatibility and reset checks.

---

[← Parent](../README.md) · [Next →](assessmentDataSource.ts) · [↑ Top](#top)
