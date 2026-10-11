# Guía de implementación: flujo de autoría de evaluaciones

Estado: guía para implementadores y agentes AI. No autoriza conectar backend real ni resolver decisiones de dominio no confirmadas.

## 1. Objetivo de esta guía

Construir una maqueta casi productiva, local, determinista y reemplazable por API REST. Cada módulo debe entregar valor observable y poder probarse de forma aislada. La implementación se debe hacer por Work Units pequeños, con validación Make y revisión visual antes de avanzar.

Orden recomendado:

1. Entrada sin datos y creación de borrador.
2. Propósito.
3. ContentSet y materiales.
4. Objetivos.
5. Rúbrica.
6. Preguntas y evidencias.
7. Corrección y feedback.
8. Revisión de coherencia.
9. Asignación.
10. Fechas, ponderaciones y publicación.

No implementar pantallas posteriores como enlaces falsos: si el destino aún no existe, mostrar la 404 contextual dentro del AppShell.

## 2. Capas obligatorias

La dirección de dependencias es:

`Route/Page TSX → Page Hook → Domain Hooks → Domain Services → Access Data Hooks → Data Sources`

### 2.1 Route/Page TSX

La ruta lee params y query params, llama al hook principal, compone la vista y conecta navegación. No debe contener:

- llamadas directas a fetch, API o localStorage;
- fixtures importados directamente;
- reglas de dominio;
- transformaciones extensas;
- permisos calculados en JSX;
- estilos inline para layout;
- acciones genéricas que oculten el destino real.

Nombre sugerido: `AssessmentAuthoringPage.tsx` o una página por etapa con responsabilidad explícita.

### 2.2 Page Hook

Cada pantalla tiene su hook de orquestación, por ejemplo:

- `useAssessmentAuthoringPage`;
- `useAssessmentPurposePage`;
- `useContentSetPage`;
- `useObjectivePage`;
- `useRubricPage`;
- `useQuestionBuilderPage`;
- `useAssignmentPage`.

Coordina loading, error, retry, estado de navegación, query params, eventos de pantalla, permisos y composición de hooks de dominio. Devuelve un view model estable para la página.

### 2.3 Hooks de dominio

Representan operaciones del producto, no detalles de presentación:

- `useAssessmentDraft`;
- `useAssessmentReadiness`;
- `useObjectiveCoverage`;
- `useRubricValidation`;
- `useQuestionBlueprint`;
- `useAssignmentRules`;
- `usePublicationReadiness`.

Las reglas puras deben vivir en funciones sin React:

- `assessmentReadiness`;
- `objectiveCoverage`;
- `rubricRules`;
- `questionRules`;
- `assignmentRules`;
- `publicationRules`.

Deben poder probarse con tablas de casos sin montar componentes.

### 2.4 Hooks de acceso a datos

Abstraen el origen y exponen estados de lectura/escritura:

- `useAssessmentData`;
- `useContentSetData`;
- `useMaterialData`;
- `useObjectiveData`;
- `useRubricData`;
- `useAssignmentData`.

La página no sabe si usa fixtures, localStorage o API REST.

### 2.5 Data sources y adaptadores

Cada recurso debe tener un contrato interno sustituible:

- `fixtureAssessmentDataSource`;
- `localAssessmentDataSource`;
- `apiAssessmentDataSource`.

La primera maqueta usa fixtures deterministas y, cuando sea necesario, localStorage detrás del adaptador. No presentar persistencia local como backend real. Los tipos internos deben separar entidades conceptuales de DTOs externos.

### 2.6 Componentes presentacionales

Reciben datos, permisos y callbacks por props. No llaman API, no leen localStorage, no importan fixtures, no deciden permisos, no conocen rutas globales y no ejecutan reglas de dominio.

Jerarquía esperada:

`AppShell → Page → PageHeader/PageSection → feature component → loading/error/empty`

## 3. Estructura de feature sugerida

`web/src/features/assessment-authoring/`

- `AssessmentAuthoringPage.tsx`
- `AssessmentAuthoringPage.module.css`
- `hooks/useAssessmentAuthoringPage.ts`
- `hooks/useAssessmentDraft.ts`
- `hooks/useAssessmentData.ts`
- `domain/types.ts`
- `domain/assessmentReadiness.ts`
- `domain/objectiveCoverage.ts`
- `domain/rubricRules.ts`
- `data/assessmentDataSource.ts`
- `data/fixtureAssessmentDataSource.ts`
- `data/localAssessmentDataSource.ts`
- `components/AssessmentPurposeSection.tsx`
- `components/ContentSetSection.tsx`
- `components/ObjectiveBuilder.tsx`
- `components/RubricEditor.tsx`
- `components/AssessmentProgress.tsx`
- `__tests__/*`

Ajustar la estructura a las convenciones reales del repositorio después de inspeccionar features existentes. La separación conceptual no es opcional.

## 4. Qué reutilizar

Antes de crear algo, inspeccionar y reutilizar:

- AppShell, sidebar, navbar y drawer;
- Page, PageHeader y PageSection;
- Button, IconButton, inputs, selects y badges;
- estados de loading, empty, error y retry;
- overlays y diálogos;
- acciones primarias/secundarias;
- tokens y CSS Modules;
- patrones de navegación contextual;
- wrappers Make y configuración Playwright existentes.

No duplicar shell, navbar, sidebar, botones, filtros ni estados. Si un componente existente no alcanza, extenderlo con props compatibles antes de crear otro.

## 5. Qué componer

Componer una pantalla a partir de piezas de responsabilidad:

- encabezado + progreso;
- sección de propósito;
- lista/uploader de materiales;
- constructor de objetivos;
- editor de rúbrica;
- constructor de preguntas;
- resumen de coherencia;
- selector de asignaciones;
- resumen de permisos y publicación.

Los componentes deben ser independientes de la etapa concreta cuando su responsabilidad sea común.

## 6. Qué puede ser nuevo

Crear componente nuevo solamente si:

1. expresa una responsabilidad de producto clara;
2. tiene entrada/salida documentada;
3. soporta loading, empty, error, retry y permisos cuando corresponde;
4. puede probarse aislado;
5. no duplica una pieza existente;
6. no está nombrado por una evaluación, curso o fixture concreto.

Nombres válidos: `MaterialUploader`, `ObjectiveBuilder`, `RubricCriterion`, `QuestionBuilder`, `AssignmentContextSelector`, `ReadinessSummary`.

Evitar: `ApiRestQuestionBuilder`, `RecursivityFeedbackPanel`, `TeacherHomeRubricCard`, `DemoAssessmentCard`.

## 7. Contrato mínimo de cada Work Unit

Cada Work Unit debe documentar:

- objetivo observable;
- ruta y punto de entrada;
- entradas;
- salida y persistencia esperada;
- estado vacío;
- loading;
- error y retry;
- permisos;
- validaciones;
- eventos y navegación;
- componentes reutilizados;
- componentes nuevos;
- reglas puras involucradas;
- fixtures;
- tests Jest/Testing Library;
- smoke Playwright;
- criterios visuales responsive;
- bloqueos o UNKNOWN;
- comando Make usado para validar.

Una Work Unit no debe depender de la siguiente para demostrar que funciona.

## 8. Datos demo y estados

Fixtures deterministas deben cubrir al menos:

- primer ingreso sin datos;
- borrador incompleto;
- material procesando;
- propuesta IA pendiente;
- objetivo sin evidencia;
- rúbrica inválida;
- evaluación lista para revisar;
- solo lectura;
- permiso insuficiente;
- error recuperable;
- publicación bloqueada.

Etiquetar todo como demo/local. Nunca usar texto que parezca dato real sin indicarlo.

## 9. Persistencia y reemplazo

Definir interfaces de data source antes de la UI. La versión local puede guardar borradores en localStorage mediante un adaptador y debe permitir resetear datos para tests. La UI no debe conocer las claves de almacenamiento.

Cuando llegue API REST, reemplazar el adaptador, no reescribir páginas ni componentes. Mapear DTOs a tipos internos en un único lugar.

## 10. Reglas de IA y decisiones humanas

Toda propuesta IA debe incluir origen, material usado, fecha, confianza/incertidumbre, limitaciones y acciones aceptar/editar/rechazar. El estado de propuesta no equivale a aprobación.

Aprobación y publicación son operaciones distintas. Un botón debe decir exactamente qué cambia y quedar deshabilitado si no se cumplen permisos o readiness.

## 11. Pruebas obligatorias

Pruebas unitarias:

- reglas de readiness;
- cobertura de objetivos;
- validación de rúbrica;
- preguntas y evidencias;
- asignaciones;
- publicación;
- adaptación fixture/local.

Testing Library:

- edición y guardado;
- estados loading/empty/error/retry;
- permisos y solo lectura;
- propuestas IA;
- navegación y retorno;
- deshabilitación durante carga.

Playwright:

- entrada sin datos;
- recorrido de una Work Unit;
- viewport desktop/tablet/teléfono;
- no overflow horizontal;
- navegación a rutas existentes;
- 404 contextual para destinos no implementados;
- persistencia y retorno del borrador;
- estados demo seleccionables.

## 12. Gates Make

Usar los wrappers existentes y no sustituirlos por comandos manuales en el informe:

- `make help`;
- `make deps`;
- `make lint`;
- `make test`;
- `make build WEB_PROFILE=local-preview`;
- `make preview-smoke`;
- `make validate WEB_PROFILE=local-preview`;
- `git diff --check`.

Separar gates deterministas de smoke visual, E2E con servicios, Firebase y Docker. Reportar cada resultado y su causa. No declarar éxito global si un gate falló.

## 13. Criterios de revisión

Rechazar una implementación si:

- mezcla API y presentación en TSX;
- accede a localStorage desde componentes;
- duplica AppShell/navbar/sidebar;
- duplica estilos inline o layout;
- encierra reglas de dominio en JSX;
- inventa entidades como si fueran backend;
- no ofrece loading/error/empty/retry;
- deja acciones genéricas sin destino;
- presenta IA como decisión final;
- no tiene pruebas deterministas;
- no valida responsive y overflow;
- no documenta UNKNOWN.

## 14. Primera Work Unit recomendada

Implementar únicamente “Entrada sin datos + crear borrador + propósito mínimo”.

Aceptación:

- `/preview/assessments` muestra estado vacío explicativo;
- “Crear mi primera evaluación” navega a la pantalla de propósito;
- el docente puede ingresar título, propósito y temática;
- guardar crea un borrador local determinista;
- salir y volver recupera el borrador;
- loading y error tienen comportamiento testeable;
- no se exige institución, curso, sección ni alumno;
- los destinos futuros muestran 404 contextual;
- todos los gates Make aplicables pasan.

## 15. Nota para agentes AI

Antes de modificar archivos:

1. inspeccionar rama, worktree y cambios ajenos;
2. leer AGENTS.md y guías relevantes;
3. inspeccionar componentes y hooks existentes;
4. declarar el Work Unit exacto;
5. no ampliar el alcance sin informar;
6. preservar cambios ajenos;
7. implementar, validar y reportar archivos, comandos, resultados y bloqueos;
8. no hacer commit, push ni PR sin autorización explícita.

