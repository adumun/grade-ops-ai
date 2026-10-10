# WEBUI-001 — Contrato conceptual de datos y prioridad del Inicio docente

**Issue:** #109
**Work Item padre:** WEBUI-001 — Inicio docente orientado a decisiones
**Estado:** documentación histórica de análisis y especificación técnica;
WEBUI-001 está cerrado y su implementación vigente está en `develop`; no es un
contrato implementado
**Alcance:** read model conceptual del Inicio docente autenticado y reglas
deterministas para la cola de trabajo. No implementa API, backend,
persistencia, React ni cambios en la arquitectura de información.

Este documento se conserva como artefacto complementario de WEBUI-001. No
reabre el Work Item ni convierte el read model conceptual en un contrato
backend vigente.

## 1. Estado actual comprobado

### 1.1 API y backend existentes

La API expone actualmente `GET /api/v1/assessments`, protegido por
autenticación, y lo ejecuta con el `uid` del docente autenticado:

- `api/src/main/java/cl/gradeops/ai/api/assessment/infrastructure/adapter/in/web/AssessmentController.java:53-70`
- `api/src/main/java/cl/gradeops/ai/api/assessment/application/usecase/ListAssessmentsHandler.java:10-20`
- `api/src/main/java/cl/gradeops/ai/api/assessment/infrastructure/adapter/out/persistence/AssessmentJpaRepository.java:21-29`

El resumen existente contiene solamente:

| Campo existente | Evidencia | Observación |
|---|---|---|
| `id` | `AssessmentSummaryResponse.java:5-11` | Identificador de evaluación |
| `title` | `AssessmentSummaryResponse.java:5-11` | Título proyectado desde revisión o topic |
| `status` | `AssessmentStatus.java:3-8` | `DRAFT`, `OPEN`, `GRADING`, `CLOSED` |
| `submissionCount` | `AssessmentSummaryResponse.java:5-11` | El adaptador actual devuelve `0` |
| `pendingApprovals` | `AssessmentSummaryResponse.java:5-11` | El adaptador actual devuelve `0` |
| `reportLink` | `AssessmentSummaryResponse.java:5-11` | El adaptador actual devuelve `null` |

La proyección SQL solo une `assessments`, `assessment_briefs` y la revisión
actual, filtrando por `teacher_uid` y ordenando por `created_at DESC`:

- `api/src/main/java/cl/gradeops/ai/api/assessment/infrastructure/adapter/out/persistence/AssessmentJpaRepository.java:21-29`
- `api/src/main/java/cl/gradeops/ai/api/assessment/infrastructure/adapter/out/persistence/AssessmentPersistenceAdapter.java:29-40`

La entidad `Assessment` contiene `teacherUid`, `status`, `createdAt`,
`currentRevisionId` y `lockVersion`, pero no contiene institución, periodo,
curso, sección, entrega, revisión, feedback, publicación o permisos por
capacidad:

- `api/src/main/java/cl/gradeops/ai/api/assessment/domain/model/Assessment.java:9-25`
- `api/src/main/resources/db/migration/V9__add_assessments.sql:1-8`
- `api/src/main/resources/db/migration/V15__add_assessment_current_revision.sql:1-3`

### 1.2 Autenticación y autorización existentes

La autenticación crea un `AuthenticatedTeacher(uid, email)` sin authorities:

- `api/src/main/java/cl/gradeops/ai/api/shared/infrastructure/config/security/AuthenticatedTeacher.java:3`
- `api/src/main/java/cl/gradeops/ai/api/shared/infrastructure/config/security/FirebaseTokenFilter.java:39-43`

La configuración exige autenticación para las rutas no públicas, pero no hay
evidencia de capacidades `leer`, `preparar`, `revisar` o `aprobar/publicar` por
recurso:

- `api/src/main/java/cl/gradeops/ai/api/shared/infrastructure/config/security/SecurityConfig.java:42-56`
- `api/src/main/java/cl/gradeops/ai/api/shared/infrastructure/config/security/AuthenticatedTeacher.java:3`

La documentación de seguridad recomienda roles `teacher`, `operator` y
`admin`, además de aislamiento por organización, pero los roles de la
documentación no constituyen un contrato implementado para este Inicio:

- `docs/04-architecture/security.md:58-70`

### 1.3 Web y tests existentes

La vista actual de dashboard consume `getAssessments()` y renderiza la lista
de evaluaciones; no consume un read model de “Todas mis clases” ni una cola de
pendientes:

- `web/src/lib/api/assessments.ts:18-22`
- `web/src/app/(protected)/dashboard/page.tsx:11-25,44-75`
- `web/src/types/assessment.ts:1-10`

Los tests existentes verifican autenticación, lista de evaluaciones, estados y
conteos del DTO actual, pero no verifican contexto académico, prioridad,
entregas, feedback, publicación o capacidades por acción:

- `api/src/test/java/cl/gradeops/ai/api/assessment/infrastructure/adapter/in/web/AssessmentControllerTest.java:95-147`
- `web/src/app/(protected)/dashboard/__tests__/DashboardPage.test.tsx:11-64`

### 1.4 Evidencia de ausencia

La revisión de `api/src/main/java` y `api/src/main/resources/db/migration`
no encontró implementaciones para entidades o rutas de `Institution`,
`AcademicPeriod`, `Course`, `Section`, `Submission`, `Feedback`, `Review`,
`Approval`, `Publication` o `Enrollment`. En consecuencia, sus contratos,
campos, estados y relaciones físicas son `UNKNOWN`.

La documentación canónica sí describe esos conceptos como modelo objetivo,
pero advierte que no es un esquema físico y que las entidades existentes deben
clasificarse antes de migrar:

- `docs/04-architecture/data-model.md:1-3,11-31,48-82`

## 2. Alcance del Inicio docente

El Inicio debe responder qué requiere una decisión o acción del docente y
derivar al contexto completo. No sustituye las pantallas de Operaciones,
Calendario, evaluación, revisión o Reportes.

El contexto inicial aprobado es **“Todas mis clases”**. La cola puede agregar
pendientes de múltiples clases y debe permitir filtrar explícitamente por:

- institución opcional;
- período;
- curso/asignatura;
- sección o grupo.

La visita previa a una clase no puede ocultar trabajo del resto. La selección
persistida de filtros, si existe, es un detalle técnico pendiente y no cambia
el alcance inicial.

La especificación visual aceptada permanece como fuente de jerarquía y
composición:

- `web/docs/design/webui-001-teacher-home-design.md:20-29,49-90`
- `web/docs/design/webui-001-teacher-home-design.md:146-210`

## 3. Read model conceptual

Este modelo es una forma de razonar sobre la futura lectura agregada. No define
JSON, nombres definitivos de DTO, tablas ni endpoints. Los nombres sin evidencia
de implementación se marcan como conceptuales.

```text
TeacherHomeReadModel [CONCEPTUAL]
├── academicScope
│   ├── selection: ALL_CLASSES | FILTERED_CONTEXT [CONCEPTUAL]
│   ├── institution: optional AcademicInstitutionRef [UNKNOWN]
│   ├── period: AcademicPeriodRef [UNKNOWN]
│   ├── courseOrSubject: CourseRef [UNKNOWN]
│   └── sectionOrGroup: optional SectionRef [UNKNOWN]
├── workQueue: WorkQueueItem[] [CONCEPTUAL]
├── upcomingAssessments: UpcomingAssessment[] [CONCEPTUAL]
├── followUp: FollowUpSummary [CONCEPTUAL]
└── freshness: ReadFreshness [CONCEPTUAL]
```

### 3.1 Reglas del read model

- Debe estar acotado al docente autenticado y a los contextos autorizados.
- Debe devolver estados de negocio, no estados inventados por la interfaz.
- Debe identificar el alcance aplicado para que “sin resultados para filtros” no
  se confunda con “sin pendientes globales”.
- Debe permitir que una cola agregada conserve el contexto de cada pendiente.
- Debe evitar N+1 en la lectura agregada; la necesidad de una consulta o
  composición concreta es `UNKNOWN`.
- Debe distinguir dato ausente de conteo cero.
- Debe exponer frescura o, si no puede garantizarla, declarar `UNKNOWN` en vez
  de presentar los datos como actuales.

### 3.2 Filtros conceptuales

| Filtro | Cardinalidad | Regla | Evidencia actual |
|---|---|---|---|
| institución | 0..1 | Opcional; no debe ser requisito para mostrar “Todas mis clases” | `UNKNOWN` en API/persistencia |
| período | 0..1 en la vista; selección explícita | Filtra el alcance académico | `UNKNOWN` en API/persistencia |
| curso/asignatura | 0..1 en la vista; selección explícita | Filtra dentro del período y relaciones autorizadas | `UNKNOWN` en API/persistencia |
| sección/grupo | 0..1 en la vista; cuando aplique | Filtra la entrega concreta del curso | `UNKNOWN` en API/persistencia |

Las referencias a `Institution`, `AcademicPeriod`, `Course` y `Section` existen
como conceptos objetivo en `docs/04-architecture/data-model.md:11-19`, no como
entidades verificadas en el código actual.

## 4. Estructura conceptual de una pendiente

Cada elemento de `workQueue` debe contener la siguiente información conceptual.
Esto no autoriza todavía un DTO ni una tabla.

| Campo | Definición | Regla ante ausencia | Evidencia |
|---|---|---|---|
| `type` | Tipo de trabajo: bloqueo, vencimiento, revisión solicitada, feedback o preparación | `UNKNOWN`; no inferir desde el título | Conceptual; `UNKNOWN` en API actual |
| `priority` | Clase determinista y razón legible | `UNKNOWN_DATA` si faltan datos para clasificar | Prioridad aprobada en `web/docs/design/webui-001-teacher-home-design.md:76-83,482-489` |
| `title` | Nombre del recurso o acción | `UNKNOWN`; no usar un nombre inventado | `AssessmentSummary.title` existe |
| `context` | Institución opcional, período, curso/asignatura, sección/grupo, evaluación, entrega o estudiante según autorización | Mostrar solo datos disponibles y etiquetar faltantes | Solo evaluación/título están parcialmente evidenciados |
| `reason` | Explicación de por qué aparece y por qué tiene esa prioridad | “Razón no disponible”; no ocultar el dato faltante | Conceptual; `UNKNOWN` en API actual |
| `dueAt`/`date` | Fecha o instante relevante, con zona horaria | “Fecha por confirmar”; nunca convertir ausencia en vencimiento | `createdAt` existe en `Assessment`, fecha operativa es `UNKNOWN` |
| `status` | Estado autoritativo del recurso o procesamiento | “Estado no disponible”; no mostrar `0` o éxito por defecto | Assessment status existe; estados de entrega/feedback son `UNKNOWN` |
| `primaryAction` | Verbo concreto de la acción posible | Deshabilitar si no existe capacidad o destino | Acción/destino actuales son `UNKNOWN` |
| `destination` | Ruta o contexto de destino | No renderizar enlace si el destino no existe | `reportLink` existe en DTO, pero es `null` en el adaptador actual |
| `permission` | Capacidades efectivas para esa acción | Denegar de forma segura y explicar | Solo autenticación está implementada |
| `freshness` | Momento y calidad de la lectura | Marcar `UNKNOWN` o `STALE`; no afirmar actualidad | No existe en el DTO actual |

Una pendiente nunca significa que la acción ya fue aprobada, publicada,
calificada o entregada. La aprobación y la publicación son pasos distintos en
la documentación UX:

- `docs/06-ux/teacher-workspace-ux.md:53-76`
- `docs/02-product/user-stories/epic-06-feedback-generation-approval/02-feedback-approval.md:9-16`
- `docs/02-product/user-stories/epic-13-student-invitation-access/04-publish-results-student-access.md:9-17`

## 5. Algoritmo determinista de prioridad

La regla aprobada para la primera clasificación es, en orden ascendente:

1. **Bloqueos o vencimientos de hoy.** Incluye un bloqueo que impida publicar,
   revisar o completar el flujo, o una fecha límite que sea hoy o anterior en
   la zona horaria académica aplicable.
2. **Acciones próximas a vencer.** La fecha futura más próxima que requiere
   acción del docente.
3. **Revisiones solicitadas.** Solicitudes explícitas que requieren atención
   docente y no encajan en una categoría más urgente por fecha.
4. **Feedback pendiente.** Feedback sin estado final docente o que requiere
   revisión antes de poder publicarse.
5. **Preparaciones futuras.** Evaluaciones, rúbricas u otros recursos que aún
   requieren preparación, sin bloqueo o vencimiento próximo conocido.

La IA puede sugerir contexto o prioridad secundaria, pero no puede cambiar
silenciosamente esta clasificación. El valor mostrado debe incluir la razón
determinista.

### 5.1 Pseudocódigo conceptual

```text
classify(item, now, academicZone):
  if item.hasBlockingCondition and item.blockingConditionIsActionable:
    return 1, "bloqueo"
  if item.dueAt exists and localDate(item.dueAt, academicZone) <= localDate(now, academicZone):
    return 1, "vencimiento de hoy o vencido"
  if item.dueAt exists and item.requiresTeacherAction:
    return 2, "acción próxima a vencer"
  if item.reviewRequested:
    return 3, "revisión solicitada"
  if item.feedbackState in {WITHOUT_FEEDBACK, AI_GENERATED, TEACHER_REVIEW_PENDING,
                            REQUIRES_REEVALUATION}:
    return 4, "feedback pendiente"
  if item.isPreparation and item.requiresTeacherAction:
    return 5, "preparación futura"
  return UNKNOWN_DATA, "datos insuficientes para clasificar"
```

El algoritmo no permite inferir que un `DRAFT`, `OPEN`, `GRADING` o `CLOSED`
actual sea automáticamente una de las cinco categorías: esos estados son de
`AssessmentStatus` y no contienen por sí solos vencimiento, bloqueo o permiso.

### 5.2 Desempates deterministas

Para ítems dentro de la misma categoría, la propuesta técnica es:

1. fecha operativa ascendente cuando exista;
2. estado de bloqueo antes que estado no bloqueante;
3. contexto académico normalizado ascendente;
4. identificador estable del recurso ascendente;
5. identificador estable de la pendiente ascendente.

Si cualquiera de los identificadores necesarios no existe en el contrato,
debe definirse antes de implementar. No se permite desempatar por orden de
llegada, posición de tarjeta, resultado de IA o tiempo de renderizado.

## 6. Datos faltantes y frescura

| Dato faltante | Comportamiento seguro |
|---|---|
| fecha | No clasificar como vencido ni próximo; usar `UNKNOWN_DATA`, mostrar “Fecha por confirmar” y ordenar después de ítems clasificables |
| estado | No inferir éxito, pendiente o publicación; mostrar “Estado no disponible” y derivar al contexto si existe |
| contexto | No inventar institución, período, curso o sección; mostrar “Contexto pendiente” y no revelar datos no autorizados |
| conteo | `Conteo no disponible`, nunca `0` salvo confirmación autoritativa |
| permiso | No simular disponibilidad; deshabilitar o no mostrar la acción según la política que se confirme |
| destino | No crear una ruta implícita; dejar la acción no disponible y registrar la brecha |
| frescura | Mostrar `UNKNOWN` o `STALE`; no presentar la cola como sincronizada |

La frescura conceptual debe distinguir al menos:

- `CURRENT`: lectura dentro de la ventana aceptada;
- `STALE`: lectura fuera de la ventana o con dependencia desactualizada;
- `UNKNOWN`: el sistema no puede demostrar cuándo se obtuvo o validó.

La ventana temporal, el reloj autoritativo, la zona horaria por institución y
la forma de detectar cambios son `UNKNOWN` y requieren confirmación técnica.

## 7. Estados de feedback

El Inicio debe distinguir estos estados conceptuales y nunca colapsarlos en
“feedback listo”:

| Estado conceptual | Significado | Puede publicarse directamente |
|---|---|---:|
| `WITHOUT_FEEDBACK` | No existe feedback generado o registrado | No |
| `AI_GENERATED` | Existe una propuesta generada por IA | No |
| `TEACHER_REVIEW_PENDING` | La propuesta espera revisión docente | No |
| `APPROVED` | El docente aprobó la versión de feedback | No necesariamente |
| `PUBLISHED` | El feedback aprobado fue entregado al alumno | Sí, ya publicado |
| `REQUIRES_REEVALUATION` | Cambió una dependencia o la revisión exige nueva evaluación | No |

La evidencia de producto también menciona `edited` y `rejected`:
`docs/02-product/user-stories/epic-06-feedback-generation-approval/02-feedback-approval.md:13-16`.
No existe evidencia de su representación física ni de su correspondencia exacta
con los seis estados aprobados; queda `UNKNOWN` si son estados adicionales,
transiciones o metadatos de revisión.

`AI_GENERATED` no equivale a `APPROVED` ni a `PUBLISHED`. La aprobación nunca
implica publicación, según `docs/06-ux/teacher-workspace-ux.md:53-65`.

## 8. Permisos conceptuales

El modelo de permisos del Inicio debe expresar capacidades, separadas de la
autenticación:

| Capacidad | Permite | No implica |
|---|---|---|
| `READ` | Ver el recurso y su estado autorizado | Preparar, revisar o aprobar/publicar |
| `PREPARE` | Crear o modificar preparación en el contexto permitido | Revisar o aprobar/publicar |
| `REVIEW` | Revisar entregas, propuestas o feedback | Aprobar/publicar automáticamente |
| `APPROVE_PUBLISH` | Ejecutar aprobación o publicación cuando el flujo lo permita | Que aprobación y publicación sean una sola operación |

La UI puede deshabilitar una acción no permitida con explicación, pero la API
debe volver a validar la capacidad al ejecutar el comando. Esta regla está
alineada con `web/docs/gradeops-ai-frontend-guidelines/15-backend-frontend-contracts.md:52-64`.

El vínculo entre capacidades y roles, la granularidad por institución,
curso, sección, evaluación o alumno, y la existencia de delegación son
`UNKNOWN`. La autenticación actual no prueba ninguna de las cuatro capacidades
por separado.

## 9. Reglas de “Todas mis clases” y selección de contexto

1. El alcance inicial es `ALL_CLASSES`, no la última clase visitada.
2. La cola solo incluye recursos dentro de las relaciones académicas que el
   docente puede leer.
3. Los filtros reducen explícitamente el conjunto: institución opcional,
   período, curso/asignatura y sección/grupo.
4. Cada pendiente conserva su contexto de origen aunque la cola esté agregada.
5. Un filtro sin resultados significa “sin resultados para este alcance”, no
   “sin trabajo en todas mis clases”.
6. Una clase, sección o evaluación no autorizada no debe revelarse mediante
   conteos, nombres, errores diferenciados o enlaces.
7. La persistencia de filtros entre sesiones es opcional en esta especificación;
   su política y fuente de verdad son `UNKNOWN`.

## 10. Criterios de aceptación para implementación

La implementación futura no puede comenzar como contrato cerrado hasta que:

- exista un read model aprobado que identifique alcance, filtros y frescura;
- las fuentes autoritativas de institución, período, curso, sección,
  evaluación, entrega y estudiante estén identificadas;
- la cola devuelva pendientes agregadas sin N+1 no justificado;
- cada pendiente incluya los campos definidos en la sección 4 o un estado
  explícito de dato desconocido;
- la clasificación de prioridad produzca el mismo orden para la misma entrada;
- los desempates estén cubiertos por pruebas con fechas iguales, faltantes y
  contextos múltiples;
- la zona horaria y la definición operativa de “hoy” estén confirmadas;
- los seis estados de feedback estén mapeados a estados/transiciones reales;
- las cuatro capacidades estén resueltas por autorización backend y reflejadas
  en el read model o en comandos consultables;
- aprobación y publicación sean operaciones separadas y auditables;
- los conteos no conviertan `UNKNOWN` en `0`;
- se cubran datos vacíos, parciales, stale, errores y permisos parciales;
- existan pruebas de alcance por docente y de no filtración entre contextos;
- el contrato web se derive del API aprobado, sin tipos frontend inventados.

## 11. Decisiones que requieren confirmación humana

1. ¿Cuál es el sistema autoritativo y el identificador de cada institución,
   período, curso, sección/grupo, evaluación, entrega y revisión?
2. ¿La ventana de “próxima a vencer” es fija, configurable por institución o
   dependiente del tipo de evaluación?
3. ¿Cuál es la zona horaria de “hoy” cuando el docente tiene relaciones en más
   de una institución o período?
4. ¿`edited` y `rejected` son estados de feedback visibles, transiciones o
   atributos secundarios dentro de los seis estados aprobados?
5. ¿Qué evento exacto crea `REQUIRES_REEVALUATION` y qué dependencia invalida
   aprobación o publicación?
6. ¿Las capacidades se asignan por rol, por relación docente-sección o por
   recurso? ¿Puede una capacidad variar entre clases del mismo docente?
7. ¿Cuál es la política de persistencia de filtros de “Todas mis clases”?
8. ¿Qué ventana y señal de frescura permiten etiquetar una lectura como
   `CURRENT` o `STALE`?
9. ¿Qué read model agregado se expondrá y qué paginación o límite aplica a la
   cola completa en Operaciones?
10. ¿Qué acciones corresponden a cada `type` y cuáles son sus destinos
    autoritativos?

## 12. UNKNOWN y vacíos de evidencia

Quedan explícitamente sin evidencia de implementación:

- entidades y rutas de institución, período, curso, sección, grupo,
  inscripción y asignación docente;
- entidades y rutas de entregas, revisiones, feedback, aprobaciones y
  publicaciones;
- estados persistidos de feedback y su transición a reevaluación;
- fecha operativa, vencimiento, calendario académico y zona horaria por
  contexto;
- read model agregado del Inicio y su endpoint;
- capacidades efectivas y autorización por recurso;
- identificadores y reglas de desempate disponibles en el contrato;
- cálculo de frescura y ventana de stale;
- conteos autoritativos de entregas, feedback y aprobaciones;
- acciones y destinos de cada tipo de pendiente.

La ausencia anterior no se resuelve suponiendo que `AssessmentStatus`,
`submissionCount` o `pendingApprovals` actuales representen esos conceptos.

## 13. Evidencia revisada

### Documentación canónica y producto

- `docs/04-architecture/data-model.md`
- `docs/04-architecture/api-design.md`
- `docs/04-architecture/security.md`
- `docs/06-ux/teacher-workspace-ux.md`
- `docs/02-product/user-stories/epic-01-teacher-onboarding/02-assessment-dashboard.md`
- `docs/02-product/user-stories/epic-04-submission-intake/04-submission-status.md`
- `docs/02-product/user-stories/epic-06-feedback-generation-approval/02-feedback-approval.md`
- `docs/02-product/user-stories/epic-13-student-invitation-access/04-publish-results-student-access.md`

### Especificación visual y contratos web

- `web/docs/design/webui-001-teacher-home-design.md`
- `web/docs/gradeops-ai-frontend-guidelines/15-backend-frontend-contracts.md`
- `web/src/types/assessment.ts`
- `web/src/lib/api/assessments.ts`
- `web/src/app/(protected)/dashboard/page.tsx`
- `web/src/app/(protected)/dashboard/__tests__/DashboardPage.test.tsx`

### Backend, persistencia y tests

- `api/src/main/java/cl/gradeops/ai/api/assessment/infrastructure/adapter/in/web/AssessmentController.java`
- `api/src/main/java/cl/gradeops/ai/api/assessment/application/usecase/ListAssessmentsHandler.java`
- `api/src/main/java/cl/gradeops/ai/api/assessment/domain/model/Assessment.java`
- `api/src/main/java/cl/gradeops/ai/api/assessment/domain/model/AssessmentStatus.java`
- `api/src/main/java/cl/gradeops/ai/api/assessment/infrastructure/adapter/out/persistence/AssessmentJpaRepository.java`
- `api/src/main/java/cl/gradeops/ai/api/assessment/infrastructure/adapter/out/persistence/AssessmentPersistenceAdapter.java`
- `api/src/main/java/cl/gradeops/ai/api/assessment/infrastructure/adapter/in/web/response/AssessmentSummaryResponse.java`
- `api/src/main/java/cl/gradeops/ai/api/shared/infrastructure/config/security/SecurityConfig.java`
- `api/src/main/java/cl/gradeops/ai/api/shared/infrastructure/config/security/AuthenticatedTeacher.java`
- `api/src/main/java/cl/gradeops/ai/api/shared/infrastructure/config/security/FirebaseTokenFilter.java`
- `api/src/main/resources/db/migration/V9__add_assessments.sql`
- `api/src/main/resources/db/migration/V10__add_assessment_briefs.sql`
- `api/src/main/resources/db/migration/V11__add_assessment_drafts.sql`
- `api/src/main/resources/db/migration/V12__add_agent_execution_logs.sql`
- `api/src/main/resources/db/migration/V13__add_agent_attempts_and_ai_operations.sql`
- `api/src/main/resources/db/migration/V14__add_assessment_revisions.sql`
- `api/src/main/resources/db/migration/V15__add_assessment_current_revision.sql`
- `api/src/test/java/cl/gradeops/ai/api/assessment/infrastructure/adapter/in/web/AssessmentControllerTest.java`

La documentación visual aceptada no fue modificada.

[← Diseño visual](webui-001-teacher-home-design.md) · [↑ Volver al inicio](#webui-001--contrato-conceptual-de-datos-y-prioridad-del-inicio-docente)
