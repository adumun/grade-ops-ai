# WEBUI-003 — Detalle de evaluación y evidencia IA

Estado: propuesta de diseño pendiente de revisión humana

Superficie de maqueta propuesta: `/preview/operations/assessment/:assessmentId`

Perfil: `local-preview`

Fecha: 2026-10-10

## 1. Objetivo y límites

Esta superficie permite a la docente inspeccionar una evaluación concreta, comprender su contexto académico, revisar la evidencia asociada a una propuesta de IA y tomar una decisión humana explícita.

La pantalla debe responder, en este orden:

1. ¿Qué evaluación estoy revisando?
2. ¿A qué curso, asignatura, sección y periodo pertenece?
3. ¿Qué estado tiene cada dimensión del trabajo?
4. ¿Qué propuso la IA y con qué evidencia?
5. ¿Qué incertidumbres o problemas requieren atención?
6. ¿Qué decisión puedo tomar y qué consecuencia tendrá?

La maqueta será local, determinista y pseudofuncional. No ejecutará IA real, no persistirá decisiones, no aprobará ni publicará resultados reales y no presentará contratos API o entidades backend como implementados.

Debe reutilizar el `AppShell`, navbar, sidebar, contexto global de demo, componentes de datos y patrones de navegación desarrollados para WEBUI-001 y WEBUI-002.

## 2. Relación con Operaciones

La pantalla se abre desde una fila de la Bandeja de Operaciones y debe conservar el contexto de origen:

- cola activa;
- búsqueda;
- filtros;
- fecha;
- estado de demo;
- operación o evaluación que originó la navegación.

El retorno a Operaciones debe mostrar un aviso de contexto preservado y restaurar esos valores en la maqueta.

La aprobación y la publicación son operaciones distintas:

- **Aprobar:** la docente confirma que el resultado está listo para avanzar.
- **Publicar:** el resultado aprobado queda disponible para el alumno.

La pantalla no debe presentar “aprobar y publicar” como una sola acción.

## 3. Layout general

### Desktop — desde 1200 px

```text
AppShell: sidebar persistente | header persistente
┌────────────────────────────────────────────────────────────────────┐
│ Navegación │ breadcrumbs / retorno                                │
│            │ título de evaluación          estado principal        │
│            │ contexto académico + metadatos                       │
│            │ resumen de progreso/lifecycle                         │
│            │ ┌──────────────────────────┐ ┌─────────────────────┐  │
│            │ │ trabajo y evidencia      │ │ decisión docente    │  │
│            │ │ propuesta IA             │ │ acciones            │  │
│            │ │ incertidumbres            │ │ historial/resumen   │  │
│            │ │ respuestas/entregas       │ │                     │  │
│            │ └──────────────────────────┘ └─────────────────────┘  │
└────────────────────────────────────────────────────────────────────┘
```

La columna principal contiene evidencia y trabajo revisable. La columna secundaria contiene estado, permisos, acciones y consecuencias. No debe competir visualmente con la evidencia.

### Tablet — 641–1199 px

- Se conserva el AppShell compartido.
- El encabezado mantiene título, contexto y estado.
- Evidencia y decisión pasan a una columna ordenada.
- La decisión docente queda después de la evidencia principal.
- Las acciones se mantienen visibles sin quedar pegadas al borde.
- El contexto de origen permanece accesible.

### Teléfono — hasta 640 px

- Sidebar se convierte en el drawer compartido.
- Breadcrumb y retorno quedan arriba.
- El contexto se resume sin perder curso, asignatura y evaluación.
- Las secciones se apilan:
  1. resumen;
  2. lifecycle;
  3. evidencia;
  4. incertidumbres;
  5. decisión docente;
  6. historial.
- Las acciones tienen ancho táctil suficiente.
- No se utiliza una tabla horizontal para evidencia.
- No se permite overflow horizontal.

## 4. Jerarquía de componentes

```text
AppShell compartido
  AssessmentEvidencePage
    ContextReturnNotice
    AssessmentHeader
      Breadcrumbs
      AssessmentStatus
      AcademicContext
    AssessmentLifecycle
    AssessmentEvidenceLayout
      EvidenceWorkspace
        SubmissionSummary
        AiProposalCard
        UncertaintyPanel
        EvidenceTimeline
        ResponseReviewSection
      DecisionPanel
        PermissionSummary
        DecisionActions
        ConsequenceNotice
        ReviewHistory
```

Responsabilidades:

- `AssessmentEvidencePage`: compone la ruta y coordina estado local de demo.
- `AssessmentHeader`: identifica la evaluación y su contexto.
- `AssessmentLifecycle`: muestra estados independientes, no un único estado agregado.
- `EvidenceWorkspace`: organiza evidencia legible y trazable.
- `AiProposalCard`: muestra propuesta, origen, fecha, proveedor/modelo y confianza si existen en el fixture.
- `UncertaintyPanel`: muestra incertidumbres y límites; nunca las oculta detrás de un color.
- `DecisionPanel`: presenta acciones humanas y sus consecuencias.
- `DecisionActions`: usa capacidades separadas para revisar, ajustar, reevaluar, aprobar y publicar.
- `ContextReturnNotice`: conserva retorno a Operaciones y sus filtros.

Los nombres deben describir responsabilidades reutilizables. No crear componentes como `Assessment123Panel`, `OperationsEvidencePage` o `TeacherApprovalCard`.

## 5. Modelo visual de lifecycle

No debe existir un único badge que reduzca todo a “pendiente” o “completado”. La evaluación muestra dimensiones separadas:

| Dimensión | Estados de demo |
|---|---|
| Preparación | pendiente, lista, bloqueada |
| Entrega | no iniciada, incompleta, recibida, con error |
| Corrección determinista | pendiente, procesada, con discrepancias |
| Revisión docente | pendiente, en revisión, ajustada, completada |
| Feedback IA | no generado, generado, con incertidumbre, revisado |
| Aprobación | pendiente, aprobada, rechazada, requiere reevaluación |
| Publicación | bloqueada, lista para publicar, publicada |

La maqueta puede presentar estas dimensiones como una línea de progreso accesible o como secciones compactas. No debe implicar que aprobar equivale a publicar.

## 6. Evidencia IA

La propuesta de IA debe distinguirse visualmente de la decisión docente.

La tarjeta de propuesta muestra cuando corresponda:

- qué propuso la IA;
- qué pregunta, respuesta o entrega analiza;
- evidencia que respalda la propuesta;
- nivel de incertidumbre;
- proveedor/modelo como dato de demo;
- fecha de generación;
- versión o identificador de ejecución como dato de demo;
- costo estimado si el fixture lo incluye;
- advertencia de que no reemplaza la decisión docente.

La evidencia debe tener divulgación progresiva:

1. resumen comprensible;
2. razones principales;
3. evidencia expandible;
4. metadatos técnicos.

Nunca presentar confianza o score como aprobación automática.

## 7. Decisión docente

El panel de decisión debe separar:

- **Revisar:** abrir o marcar la evidencia como inspeccionada.
- **Ajustar:** registrar un ajuste manual en la maqueta.
- **Solicitar reevaluación:** devolver el caso con una apreciación docente.
- **Aprobar:** confirmar que el resultado puede avanzar.
- **Publicar:** entregar al alumno un resultado previamente aprobado.

Las acciones disponibles dependen de capacidades de demo:

- leer;
- revisar;
- ajustar;
- reevaluar;
- aprobar;
- publicar.

Una acción no disponible debe mostrar la razón. No ocultar silenciosamente una restricción de permiso.

Después de cada acción, la maqueta debe mostrar:

- feedback localizado;
- nuevo estado de la dimensión afectada;
- consecuencia esperada;
- opción de reintento si corresponde;
- conservación del contexto.

## 8. Datos deterministas

Crear fixtures nuevos dentro de la feature correspondiente. No modificar `web/src/features/teacher-operations-mock/data.ts` salvo dependencia estricta.

Los fixtures deben incluir al menos:

- una evaluación con propuesta IA pendiente de revisión;
- una evaluación con incertidumbre alta;
- una evaluación ajustada manualmente;
- una evaluación aprobada pero no publicada;
- una evaluación publicada;
- una evaluación que requiere reevaluación;
- una entrega incompleta;
- una evaluación en solo lectura;
- una combinación de permisos insuficientes;
- un caso de error recuperable;
- historial de decisiones humanas.

No usar reloj del sistema, azar, llamadas de red ni IDs generados en runtime.

## 9. Estados visuales

| Estado | Comportamiento |
|---|---|
| Carga inicial | Skeleton de encabezado, lifecycle, evidencia y decisión; acciones dependientes deshabilitadas o ausentes según corresponda. |
| Carga localizada | Solo la sección o acción afectada muestra progreso; el resto conserva contexto. |
| Sin evidencia | Explica qué falta y cuál es el siguiente paso; no simula una conclusión. |
| Error de carga | `role=alert`, causa traducida y retry; conserva breadcrumbs y contexto. |
| Error de acción | Error junto a la acción; permite reintentar sin perder la evidencia visible. |
| Solo lectura | Evidencia visible; acciones de mutación no disponibles y explicación accesible. |
| Permiso insuficiente | Se explica la capacidad faltante; no se simula aprobación o publicación. |
| Propuesta IA | Etiqueta clara como sugerencia, con incertidumbre y evidencia. |
| Aprobación pendiente | Acción humana visible y publicación todavía separada/bloqueada. |
| Aprobado | Se muestra la consecuencia y se habilita publicar solo si el fixture lo permite. |
| Publicado | Resultado visible como publicado; no ofrecer aprobación como si aún estuviera pendiente. |
| Requiere reevaluación | Se muestra la apreciación que originó el retorno y la acción disponible. |

## 10. Accesibilidad y usabilidad

- El título identifica evaluación, curso/asignatura y estado.
- Breadcrumbs o retorno tienen navegación semántica.
- Lifecycle usa texto además de color.
- Evidencia expandible usa controles accesibles y anuncia su estado.
- Errores usan `role=alert`; cambios de estado usan `role=status`.
- Acciones tienen labels claros y foco visible.
- La acción destructiva o irreversible requiere confirmación en la maqueta.
- La IA se identifica como propuesta; la decisión humana como decisión.
- Las acciones de aprobación y publicación tienen explicaciones distintas.
- El foco se conserva al cerrar overlays o volver a la bandeja.
- Textos largos hacen wrap; flex/grid usa `min-width: 0`.
- Contraste y targets táctiles siguen las guías frontend existentes.

## 11. Criterios de aceptación

1. Existe una ruta propuesta para el detalle de evaluación y evidencia IA bajo `local-preview`.
2. La ruta conserva AppShell, navbar, sidebar y estado global de demo.
3. El contexto de origen desde Operaciones se muestra y puede restaurarse.
4. El lifecycle separa preparación, entrega, corrección, revisión, feedback, aprobación y publicación.
5. La propuesta IA, su incertidumbre y su evidencia están diferenciadas de la decisión docente.
6. Aprobar y publicar son acciones independientes.
7. Se pueden demostrar revisión, ajuste, reevaluación, aprobación, publicación, solo lectura y permiso insuficiente.
8. La carga, los errores y los reintentos no destruyen contexto ni evidencia visible.
9. Desktop, tablet y teléfono no tienen overflow horizontal.
10. La solución reutiliza AppShell, navegación, botones, cards, badges y patrones de estado existentes.
11. No se inventan contratos API, persistencia ni IA real.
12. Tests deterministas cubren lifecycle, evidencia, permisos, acciones y preservación de contexto.
13. Smoke Playwright cubre la ruta, navegación desde Operaciones, responsive, errores y overflow.

## 12. Pruebas previstas

### Jest + Testing Library

- Render del encabezado y contexto académico.
- Render de lifecycle con dimensiones independientes.
- Distinción entre propuesta IA y decisión docente.
- Evidencia expandible y metadatos.
- Capacidades separadas para revisar, ajustar, reevaluar, aprobar y publicar.
- Aprobación no habilita publicación cuando el fixture no lo permite.
- Loading, error, retry, solo lectura y permiso insuficiente.
- Preservación del contexto al volver a Operaciones.
- Labels, roles, foco y anuncios de estado.

### Smoke Playwright

- Navegación desde `/preview/operations` a la evaluación.
- Render de la ruta de detalle.
- Retorno a Operaciones con contexto preservado.
- Viewports 1440, 1024, 768, 430 y 390 px.
- Sin overflow horizontal.
- Drawer compartido.
- Cambio global del estado de demo.
- Acción de aprobar separada de publicar.
- Error y retry recuperables.

## 13. Límites de implementación

Esta fase no implementa:

- API real;
- Firebase;
- ejecución de modelos;
- persistencia;
- almacenamiento de archivos;
- autenticación nueva;
- autorización real;
- publicación real de calificaciones;
- contratos backend definitivos.

Todo comportamiento será local, determinista y explícitamente demostrativo.

## 14. Validación posterior

Desde la raíz del repositorio:

```bash
make validate WEB_PROFILE=local-preview
make build WEB_PROFILE=local-preview
make preview-smoke
git diff --check
```

La inspección visual debe hacerse antes de commit y push. No se considerará completado si las pruebas pasan pero la navegación, el contexto, los permisos o la distinción entre IA y decisión humana no son comprensibles visualmente.

## 15. Decisiones pendientes no bloqueantes

- Ruta final de producción para el detalle.
- Contrato API real.
- Modelo persistente de evidencia y ejecución IA.
- Taxonomía definitiva de permisos.
- Reglas de publicación.
- Formato definitivo de historial y auditoría.
- Límites de archivos y almacenamiento.

Estas decisiones no deben inventarse en la maqueta.
