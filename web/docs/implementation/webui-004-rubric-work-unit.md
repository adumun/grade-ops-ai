# WEBUI-004 Work Unit 4 — Guía de implementación de rúbricas

Esta guía es el handoff para Codex. Debe leerse junto con:

1. `web/docs/design/webui-004-assessment-authoring-flow.md`
2. `web/docs/design/webui-004-rubric-authoring.md`
3. `web/docs/implementation/assessment-authoring-implementation-guide.md`
4. `web/docs/gradeops-ai-frontend-guidelines/02-ux-wireframes-y-maquetas.md`
5. `web/docs/gradeops-ai-frontend-guidelines/03-jerarquia-de-componentes.md`
6. `web/docs/gradeops-ai-frontend-guidelines/16-make-validation-and-agent-execution.md`

En un worktree basado en la rama documental, se pueden leer con:

```bash
git show origin/docs/assessment-authoring-flow-design:web/docs/design/webui-004-rubric-authoring.md
git show origin/docs/assessment-authoring-flow-design:web/docs/implementation/assessment-authoring-implementation-guide.md
git show origin/docs/revise-frontend-documentation-standard:web/docs/gradeops-ai-frontend-guidelines/02-ux-wireframes-y-maquetas.md
git show origin/docs/revise-frontend-documentation-standard:web/docs/gradeops-ai-frontend-guidelines/03-jerarquia-de-componentes.md
git show origin/docs/revise-frontend-documentation-standard:web/docs/gradeops-ai-frontend-guidelines/16-make-validation-and-agent-execution.md
```

## 1. Work Unit exacta

Implementar solo:

- `/preview/assessments/new/rubric`;
- selección/creación de una rúbrica local;
- criterios;
- niveles;
- descriptores;
- pesos;
- vínculo con objetivos;
- duplicación/versionado local;
- propuesta IA demo;
- loading, vacío, error, retry, solo lectura y permisos;
- navegación Objetivos ↔ Rúbrica;
- 404 contextual para Preguntas futura.

No implementar preguntas, corrección, asignación, publicación, backend, subida real ni IA real.

## 2. Arquitectura

Respetar:

`Route/Page TSX → Page Hook → Domain Hooks → Domain Services → Access Data Hooks → Data Sources`

Estructura sugerida:

```text
web/src/features/assessment-authoring/
├── RubricPage.tsx
├── hooks/
│   ├── useRubricPage.ts
│   ├── useRubricData.ts
│   ├── useRubricDraft.ts
│   └── useRubricReadiness.ts
├── domain/
│   ├── rubricRules.ts
│   ├── rubricCoverage.ts
│   ├── rubricVersioning.ts
│   ├── rubricTypes.ts
│   └── __tests__/
├── data/
│   ├── rubricDataSource.ts
│   ├── fixtureRubricDataSource.ts
│   ├── localRubricDataSource.ts
│   └── __tests__/
├── components/
│   ├── RubricBaseSelector.tsx
│   ├── RubricEditor.tsx
│   ├── RubricCriterion.tsx
│   ├── RubricLevel.tsx
│   ├── RubricCoverageSummary.tsx
│   ├── RubricAiProposal.tsx
│   └── Rubric.module.css
└── __tests__/
```

Adaptar nombres a la estructura real. La separación conceptual es obligatoria.

## 3. Modelo local mínimo

Puede usar:

```ts
type RubricLevel = {
  id: string;
  name: string;
  descriptor: string;
  score: number;
};

type RubricCriterion = {
  id: string;
  name: string;
  description: string;
  objectiveIds: string[];
  weight: number;
  levels: RubricLevel[];
};

type RubricDraft = {
  id: string;
  name: string;
  description: string;
  version: number;
  source: "manual" | "duplicated" | "demo-ai";
  status: "draft" | "ready" | "needs_review";
  criteria: RubricCriterion[];
  updatedAt: string;
};
```

No presentar estos tipos como DTO backend definitivo.

## 4. Componentes

Reutilizar AppShell, Page, PageHeader, PageSection, AssessmentProgress, Button, Input, Textarea, Select, Badge, IconButton, estados y tokens.

Crear componentes solo si expresan responsabilidad reusable:

- `RubricBaseSelector`;
- `RubricEditor`;
- `RubricCriterion`;
- `RubricLevel`;
- `RubricCoverageSummary`;
- `RubricAiProposal`.

No crear componentes con nombres de una evaluación o fixture específico.

## 5. Reglas puras

Implementar y probar sin React:

- criterio válido;
- nivel válido;
- pesos válidos;
- suma de pesos;
- cobertura de objetivos;
- criterios duplicados;
- readiness;
- duplicación sin mutación;
- decisión IA;
- permiso de edición.

Los componentes no deben contener estas reglas.

## 6. Interacciones mínimas

Debe funcionar:

- crear rúbrica nueva;
- seleccionar rúbrica demo;
- duplicar versión;
- agregar criterio;
- editar criterio;
- eliminar criterio;
- reordenar criterios;
- agregar y editar niveles;
- asociar objetivos;
- cambiar pesos;
- guardar borrador;
- recuperar localmente;
- aceptar, editar o rechazar propuesta IA;
- volver a Objetivos.

Durante loading/guardado, bloquear acciones dependientes y evitar doble envío.

## 7. Responsive y accesibilidad

Desktop:

- editor y resumen claramente separados;
- niveles legibles sin desplazamiento horizontal innecesario.

Tablet:

- reducir densidad o apilar paneles.

Teléfono:

- cada criterio se apila;
- niveles se convierten en bloques verticales;
- acciones siguen accesibles;
- no usar tablas rígidas que generen overflow.

Usar labels, headings, foco visible, teclado, `aria-current`, `aria-expanded` y nombres accesibles.

## 8. Datos demo y estados

Fixtures deben incluir:

- rúbrica vacía;
- rúbrica completa;
- criterio sin objetivo;
- criterio sin niveles;
- pesos incompletos;
- pesos excedidos;
- propuesta IA pendiente;
- propuesta aceptada;
- propuesta editada;
- solo lectura;
- permiso insuficiente;
- error recuperable.

Marcar datos como demo/local. No simular backend real.

## 9. Tests requeridos

Jest/Testing Library:

- reglas puras;
- CRUD de criterios;
- niveles;
- pesos;
- cobertura;
- duplicación;
- IA;
- loading/error/retry;
- solo lectura/permisos;
- navegación y retorno.

Playwright:

- entrar desde Objetivos;
- crear rúbrica;
- agregar criterio y niveles;
- asociar objetivo;
- mostrar advertencias;
- aceptar/editar/rechazar IA;
- duplicar versión;
- regresar a Objetivos;
- ruta futura de Preguntas como 404;
- desktop/tablet/teléfono;
- sin overflow.

## 10. Validación

Ejecutar:

```bash
git diff --check
make help
make deps
make lint
make test
make build WEB_PROFILE=local-preview
make validate WEB_PROFILE=local-preview
make preview-smoke
```

No hacer commit, push ni PR durante implementación.

## 11. Reporte esperado

Reportar:

- archivos modificados;
- componentes reutilizados;
- componentes nuevos;
- rutas;
- reglas puras;
- data sources;
- tests;
- resultados Make;
- smoke por viewport;
- UNKNOWN;
- bloqueos;
- confirmación de que no hubo commit, push ni PR.
