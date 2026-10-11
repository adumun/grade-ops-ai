# WEBUI-003 — Mapa de destinos de Operaciones

Estado: decisión de diseño pendiente de revisión humana

Rama de documentación: `feat/webui-003-assessment-evidence`

## 1. Propósito

La Bandeja de Operaciones presenta trabajo docente pendiente, pero cada acción representa una intención distinta. No todas las acciones deben llevar al mismo detalle de evidencia.

Este documento define:

- qué significa cada acción;
- cuál es su destino conceptual;
- qué pantalla debe abrir;
- qué contexto debe preservar;
- qué ocurre mientras la pantalla todavía no está implementada.

La regla principal es:

> Una acción debe llevar a la pantalla que permite completar esa acción, no a una pantalla genérica que solo muestra un resumen técnico.

## 2. Reglas de navegación

Cada operación puede tener:

1. una acción primaria, que resuelve el siguiente paso;
2. una acción secundaria de contexto, que muestra el origen académico;
3. navegación explícita, con URL estable;
4. contexto preservado al regresar.

No se debe presentar un botón genérico llamado:

- “Abrir detalle de evidencia”;
- “Ver evidencia”;
- “Ver detalle”;

si no se especifica qué evidencia se revisará y qué decisión permite tomar.

La evidencia debe aparecer dentro del destino correcto:

- respuesta del alumno dentro de la revisión de entrega;
- rúbrica dentro de la revisión de rúbrica;
- feedback dentro de la revisión de feedback;
- informe dentro del detalle del informe;
- metadatos IA dentro del contexto donde esa propuesta se está evaluando.

## 3. Mapa de acciones

| Cola | Acción visible | Qué significa | Destino conceptual | Estado de maqueta |
|---|---|---|---|---|
| Preparar | Preparar evaluación | Crear o completar la estructura de una evaluación | Constructor de evaluación | Pendiente |
| Preparar | Definir fecha | Configurar fecha, aplicación y disponibilidad | Configuración de evaluación | Pendiente |
| Revisar | Revisar entregas | Inspeccionar entregas de una evaluación | Lista de entregas | Pendiente |
| Revisar | Ver incompletas | Identificar estudiantes sin entrega completa | Seguimiento de entregas | Pendiente |
| Confirmar | Revisar rúbrica | Confirmar objetivos y criterios propuestos | Revisión de rúbrica | Pendiente |
| Confirmar | Completar feedback | Revisar y editar feedback generado por IA | Revisión de feedback | Pendiente |
| Aprobar | Aprobar feedback | Revisar la versión final antes de publicar | Aprobación de feedback | Pendiente |
| Aprobar | Revisar informe | Inspeccionar resultados agregados antes de aprobar | Detalle de informe | Pendiente |

La acción “Ver contexto” no sustituye a la acción primaria. Debe llevar al origen académico de la operación, por ejemplo:

- clase;
- asignatura;
- evaluación;
- sección;
- periodo.

## 4. Destino de revisión de entrega

La acción “Revisar entregas” debe llevar a una lista de entregas, no directamente al detalle de una entrega arbitraria.

Ruta conceptual:

```text
/preview/operations/assessment/:assessmentId/submissions
```

La lista debe permitir:

- ver estudiantes;
- distinguir entregado, incompleto, con error y pendiente;
- filtrar por estado;
- abrir una entrega concreta;
- regresar a la Bandeja de Operaciones.

La revisión de una entrega concreta debe usar una ruta separada:

```text
/preview/operations/assessment/:assessmentId/submissions/:submissionId
```

Ese es el destino apropiado para:

- preguntas;
- respuestas del alumno;
- archivos entregados;
- rúbrica aplicada;
- sugerencia IA;
- comentario docente;
- puntuación o nivel de logro;
- solicitud de reevaluación;
- aprobación del resultado.

WEBUI-003 debe evolucionar hacia esta pantalla de revisión de entrega. No debe ser un detalle genérico accesible desde todas las colas.

## 5. Destinos específicos pendientes

### Constructor de evaluación

```text
/preview/assessments/new
/preview/assessments/:assessmentId/edit
```

Debe servir para:

- objetivos;
- preguntas;
- tipos de pregunta;
- materiales;
- rúbrica;
- ponderación;
- fechas;
- asignación a curso/asignatura.

### Configuración de fecha

Puede formar parte del constructor o abrir un estado específico dentro de la evaluación:

```text
/preview/assessments/:assessmentId/schedule
```

No debe enviarse a revisión de evidencia.

### Revisión de rúbrica

```text
/preview/assessments/:assessmentId/rubric
```

Debe mostrar:

- objetivos vinculados;
- criterios;
- niveles;
- propuesta IA;
- ajustes docentes;
- confirmación explícita.

### Revisión de feedback

```text
/preview/operations/assessment/:assessmentId/feedback
```

Debe mostrar:

- respuesta o entrega relacionada;
- feedback IA;
- incertidumbre;
- edición docente;
- historial;
- acción para aprobar o solicitar reevaluación.

### Aprobación de feedback

Puede reutilizar la revisión de feedback con un modo de aprobación:

```text
/preview/operations/assessment/:assessmentId/feedback/approval
```

Aprobar no debe publicar automáticamente.

### Informe

```text
/preview/reports/:reportId
```

Debe mostrar resultados agregados, brechas y evidencia resumida antes de la aprobación.

## 6. Rutas todavía no implementadas

Cuando una acción tenga un destino definido pero la pantalla aún no exista:

- la acción debe navegar a su URL conceptual;
- debe mostrarse la 404 integrada y reutilizable;
- debe conservar AppShell, navbar y sidebar;
- debe indicar qué vista falta;
- debe permitir volver a Inicio u Operaciones;
- no debe redirigir silenciosamente;
- no debe llevar a una pantalla de evidencia incorrecta;
- no debe simular que la acción fue completada.

Ejemplo:

```text
Ruta: /preview/assessments/new
Estado: vista todavía no implementada
Acción: volver a Operaciones
```

## 7. Modelo reusable de destino

La configuración de operaciones debe poder expresar un destino estructurado:

```ts
type OperationDestination =
  | {
      kind: "route";
      href: string;
      label: string;
      context: "assessment" | "submissions" | "rubric" | "feedback" | "report";
    }
  | {
      kind: "not-implemented";
      href: string;
      label: string;
      context: "assessment" | "submissions" | "rubric" | "feedback" | "report";
    };
```

La UI no debe inferir el destino a partir del texto del botón. El fixture debe declarar explícitamente:

- acción;
- label;
- href;
- contexto;
- permisos;
- destino de retorno.

Esto evita que todas las acciones terminen en `/preview/operations` o en un detalle genérico.

## 8. Criterios de aceptación

1. Cada operación tiene una acción primaria con destino explícito.
2. “Ver contexto” y la acción primaria tienen propósitos distintos.
3. No existe “Abrir detalle de evidencia” como acción genérica.
4. “Revisar entregas” abre una lista de entregas.
5. Una entrega concreta abre la revisión de preguntas, respuestas y rúbrica.
6. Preparar, Confirmar y Aprobar no llevan por defecto a revisión de entregas.
7. Una pantalla no implementada muestra una 404 integrada, no una acción simulada como completada.
8. El contexto de Operaciones se conserva al navegar y regresar.
9. Las rutas, labels y permisos están declarados en los fixtures.
10. Las pantallas existentes no inventan persistencia ni contratos backend.

## 9. Alcance de implementación siguiente

La siguiente implementación debe priorizar:

1. corregir los destinos declarados en los fixtures;
2. separar “Revisar entregas” de “Revisar una entrega”;
3. convertir WEBUI-003 en la revisión de una entrega concreta;
4. mostrar preguntas, respuestas, rúbrica y decisión docente;
5. usar la 404 integrada para destinos todavía no implementados;
6. mantener la bandeja y el AppShell reutilizables.

No se deben crear ocho pantallas falsas solo para hacer que los botones naveguen. Primero se debe hacer correcta la navegación y luego implementar cada superficie por Work/Issue.

## 10. Validación prevista

La implementación deberá comprobar:

- cada acción navega a la ruta declarada;
- “Ver contexto” conserva su propósito;
- no existe el botón genérico de evidencia;
- una ruta no implementada muestra 404 integrada;
- la revisión de entrega muestra preguntas y respuestas;
- el retorno conserva filtros y cola;
- no hay navegación que simule éxito sin una vista destino;
- smoke responsive y ausencia de overflow.

