# WEBUI-001 — Inicio docente orientado a decisiones

**Issue:** #109
**Work Item padre:** WEBUI-001 — Inicio docente orientado a decisiones
**Estado:** documentación histórica de diseño; WEBUI-001 está cerrado y su
implementación vigente está en `develop`
**Alcance:** entrada autenticada del docente; no incluye implementación React,
contratos de API ni cambios en la arquitectura de información.

Este documento se conserva como artefacto complementario de diseño de
WEBUI-001. No describe un contrato backend implementado ni reabre el Work
Item.

## 1. Hipótesis y objetivo

### Hipótesis

Si el Inicio docente ordena el trabajo por urgencia, contexto y siguiente
acción, en lugar de presentar métricas agregadas, el docente podrá comenzar su
sesión resolviendo una tarea concreta sin tener que reconstruir el estado del
ciclo académico desde varias pantallas.

### Objetivo de diseño

Diseñar una página autenticada que responda en este orden:

1. ¿En qué contexto académico estoy?
2. ¿Qué requiere mi atención ahora?
3. ¿Qué viene pronto?
4. ¿Qué puedo hacer directamente desde aquí?

El Inicio es una cola de trabajo y decisiones. No es un dashboard institucional
ni sustituye a Operaciones o Reportes. Las métricas solo aparecen como apoyo
cuando ayudan a entender una decisión pendiente.

## 2. Usuario y contexto

### Usuario principal

Docente autenticado que administra una o varias clases, prepara evaluaciones,
revisa entregas y aprueba resultados. Puede trabajar en más de un curso,
asignatura, módulo, sección o taller durante el mismo periodo.

### Contexto de uso

- Inicio de la jornada: necesita saber qué resolver primero.
- Retorno a la aplicación: necesita recuperar el punto donde quedó.
- Antes de una evaluación: necesita anticipar preparación, publicación o
  revisión.
- Después de una entrega: necesita localizar incompletos y feedback pendiente.
- Con permisos parciales: puede ver el workspace, pero no ejecutar todas las
  acciones.

La vista inicial del Inicio es “Todas mis clases”. La institución es un filtro
opcional y secundario. El contexto principal es la relación académica concreta,
su periodo, curso/asignatura y sección o grupo.

## 3. Flujo principal

```text
Autenticación válida
        ↓
Inicio docente carga contexto disponible
        ↓
Inicio muestra “Todas mis clases” y los filtros disponibles
        ↓
Docente filtra por institución opcional, periodo, curso/asignatura o sección/grupo
        ↓
Lee la cola "Qué requiere atención"
        ↓
Selecciona una pendiente por su acción primaria
        ↓
Llega al contexto correcto: clase, evaluación, entrega o revisión
        ↓
Completa, pospone o devuelve la acción
        ↓
Regresa al Inicio con estado actualizado y contexto preservado
```

### Reglas del flujo

- Cada pendiente debe tener una acción primaria explícita y una ruta al
  contexto completo.
- El orden debe ser determinista y explicar por qué algo está primero:
  bloqueos o vencimientos de hoy, acciones próximas a vencer, revisiones
  solicitadas, feedback pendiente y preparaciones futuras, en ese orden.
- La IA puede sugerir una prioridad o aportar contexto, pero no define el orden
  silenciosamente ni sustituye la regla determinista visible para el docente.
- Abrir una pendiente no equivale a aprobar, publicar, calificar ni entregar
  contenido. Esas acciones conservan su confirmación en el flujo de destino.
- Después de volver al Inicio, la tarjeta o fila debe reflejar el estado real:
  resuelta, en procesamiento, con error o todavía pendiente.
- El Inicio no debe ocultar trabajo porque el docente haya visitado antes una
  clase específica. “Todas mis clases” es el contexto inicial; los filtros
  reducen la vista de forma explícita y reversible.

## 4. Jerarquía visual

El orden visual recomendado es:

1. **Contexto y orientación:** saludo breve, fecha, contexto “Todas mis clases”
   y filtros de institución opcional, periodo, curso/asignatura y sección/grupo.
2. **Decisión inmediata:** sección “Qué requiere atención” con máximo cinco
   pendientes visibles inicialmente, ordenados por prioridad.
3. **Horizonte próximo:** próximas evaluaciones y hitos con fecha y estado.
4. **Trabajo incompleto:** entregas incompletas y retroalimentación pendiente,
   agrupadas por clase o evaluación.
5. **Acciones directas:** crear o preparar lo que corresponda, siempre con
   verbos y alcance explícitos.

La sección de pendientes ocupa la mayor superficie y el mayor contraste. Las
próximas evaluaciones y los bloques de seguimiento son secundarios. No usar
una cuadrícula de StatCards como estructura dominante. La cola muestra
inicialmente un máximo de cinco pendientes y ofrece “Ver todas en Operaciones”.

### Prioridad visual de una pendiente

Cada pendiente muestra, en este orden:

- indicador textual de prioridad;
- verbo de acción principal;
- nombre de la evaluación, entrega o recurso;
- clase y periodo;
- razón de prioridad y fecha relevante;
- estado actual;
- acción primaria y acceso al contexto.

## 5. Acciones primarias y secundarias

### Primarias

Las acciones se derivan del tipo de pendiente y deben usar verbos concretos:

| Situación | Acción primaria | Destino esperado |
|---|---|---|
| Evaluación por preparar | Preparar evaluación | Constructor o detalle de evaluación |
| Evaluación próxima sin publicar | Revisar antes de publicar | Revisión final |
| Entregas por revisar | Revisar entregas | Revisión de la evaluación |
| Feedback pendiente | Completar feedback | Flujo de feedback de la evaluación o entrega |
| Entrega incompleta | Ver entregas incompletas | Lista filtrada de estudiantes |
| Revisión solicitada | Revisar solicitud | Contexto de la entrega o estudiante |

El texto puede variar según el contrato real, pero no debe reducirse a
“Ver más”, “Abrir” o “Continuar” cuando se conoce la acción.

### Secundarias

- Ver contexto completo.
- Cambiar o limpiar filtros de contexto.
- Ver todas en Operaciones.
- Ver todas las evaluaciones en Calendario o en el workspace de clase.
- Posponer o descartar una alerta no accionable, si el dominio lo permite.
- Reintentar una carga o procesamiento fallido, solo cuando la acción esté
  disponible y sea segura.

Las acciones secundarias no deben competir visualmente con la decisión
principal ni esconderla en un menú de tres puntos.

## 6. Wireframe / especificación visual desktop

El wireframe usa la navegación global definida por la arquitectura de
información. La barra lateral permanece estable; el contenido no incorpora una
navegación de clase salvo que el docente haya entrado a un workspace de clase.

```text
┌──────────────────────┬──────────────────────────────────────────────────────┐
│ GradeOps AI          │ Buscar...        Notificaciones   Perfil docente      │
│                      ├──────────────────────────────────────────────────────┤
│ Inicio       activo  │ Hola, Camila                  [fecha ilustrativa]    │
│ Mis clases            │ ¿Qué necesitas resolver hoy?                         │
│ Operaciones           │ [Todas mis clases ▾]                                │
│ Calendario            │                                                      │
│                      │ [Institución ▾] [Período ▾] [Curso/asignatura ▾]     │
│                      │ [Sección o grupo ▾, si aplica]                      │
│ Recursos              │ ┌──────────────────────────────────────────────────┐ │
│ Reportes              │ │ Qué requiere atención                         │ │
│                      │ │ 3 pendientes · ordenadas por prioridad          │ │
│ ──────────────────── │ │                                                  │ │
│ Ayuda                │ │ [URGENTE] Revisar 12 entregas                   │ │
│ Configuración        │ │ Programación II · Evaluación 2 · vence hoy       │ │
│ Perfil               │ │ Hay 2 entregas con error de procesamiento         │ │
│                      │ │ [Revisar entregas] [Ver evaluación]              │ │
│                      │ │──────────────────────────────────────────────────│ │
│                      │ │ [PRÓXIMO] Confirmar rúbrica                       │ │
│                      │ │ Algoritmos · Evaluación 1 · publicar en 2 días    │ │
│                      │ │ Falta aprobación docente                          │ │
│                      │ │ [Revisar rúbrica] [Ver clase]                    │ │
│                      │ │──────────────────────────────────────────────────│ │
│                      │ │ [PENDIENTE] Completar retroalimentación           │ │
│                      │ │ Programación II · 4 entregas sin feedback         │ │
│                      │ │ [Completar feedback] [Ver entregas]              │ │
│                      │ │ [Ver todas en Operaciones]                        │ │
│                      │ └──────────────────────────────────────────────────┘ │
│                      │                                                      │
│                      │ ┌──────────────────────┐ ┌─────────────────────────┐ │
│                      │ │ Próximas evaluaciones│ │ Seguimiento             │ │
│                      │ │ Evaluación 2 · 10 oct│ │ Entregas incompletas  4 │ │
│                      │ │ Evaluación 3 · 18 oct│ │ Feedback pendiente    4 │ │
│                      │ │ [Ver calendario]      │ │ [Ver en Operaciones]    │ │
│                      │ └──────────────────────┘ └─────────────────────────┘ │
│                      │                                                      │
│                      │ ┌──────────────────────────────────────────────────┐ │
│                      │ │ Accesos directos                                  │ │
│                      │ │ [Nueva evaluación] [Nueva clase] [Ver Operaciones]│ │
│                      │ └──────────────────────────────────────────────────┘ │
└──────────────────────┴──────────────────────────────────────────────────────┘
```

### Especificación de composición

- Contenedor de página de anchura controlada, con lectura cómoda y separación
  vertical consistente con los tokens del Design System.
- Encabezado de página con un solo `h1`, saludo y contexto activo.
- Contexto inicial visible como “Todas mis clases”, con filtros de institución
  opcional, periodo, curso/asignatura y sección o grupo.
- Los filtros son explícitos y no sustituyen el contexto inicial por la última
  clase visitada.
- `WorkQueueSection` como bloque principal, no como tabla de métricas.
- Cada `WorkQueueItem` funciona como unidad de lectura y navegación, con
  acción primaria visible.
- Dos bloques secundarios en desktop: horizonte próximo y seguimiento.
- Accesos directos al final del flujo visual, no antes de las decisiones
  urgentes.
- El orden visual no depende únicamente del color: el texto de prioridad,
  icono y posición aportan la semántica.

## 7. Variantes responsive

### Tablet

- Sidebar compacta con iconos y nombres disponibles mediante tooltip accesible
  o expansión temporal.
- Encabezado en dos filas si el ancho no permite contexto, buscador y acciones
  en una sola línea.
- La cola mantiene una sola columna; cada pendiente conserva título, contexto,
  razón y acción primaria.
- Próximas evaluaciones y seguimiento pasan a dos bloques apilados si pierden
  legibilidad.
- Las acciones secundarias se agrupan bajo “Más acciones”, sin ocultar la
  primaria.
- Los filtros de contexto ocupan el ancho necesario y no se truncan sin una
  alternativa accesible; “Todas mis clases” permanece disponible.

### Móvil

- Sidebar como panel deslizable desde la barra superior; se cierra al elegir
  una sección o tocar fuera.
- Barra superior con botón de menú, título corto, notificaciones y perfil.
- Saludo, fecha, contexto “Todas mis clases” y filtros en columna.
- La cola se muestra como tarjetas verticales; la acción primaria ocupa todo el
  ancho disponible.
- Cada tarjeta muestra primero prioridad, acción, recurso y fecha; la razón y
  acciones secundarias quedan debajo.
- Próximas evaluaciones y seguimiento se convierten en listas compactas,
  nunca en columnas comprimidas.
- Accesos directos pasan a una lista o carrusel horizontal con foco por teclado
  y etiquetas completas.
- La acción “Ver todas en Operaciones” permanece visible después de las cinco
  primeras pendientes.
- No se usa desplazamiento horizontal para leer una pendiente.

## 8. Estados de la pantalla

Los estados son parte del diseño, no variantes posteriores.

### Carga

- Mantener shell, título y contexto si ya están disponibles.
- Mostrar skeletons con la forma de la cola y de los bloques secundarios.
- No presentar “0 pendientes” mientras los datos siguen cargando.
- Una acción puntual muestra loader en el elemento involucrado y un mensaje
  persistente o toast; no reemplaza toda la página sin necesidad.

### Vacío

Distinguir al menos estos vacíos:

- **Sin pendientes:** “No tienes tareas pendientes. Revisa tus próximas
  evaluaciones para anticipar el siguiente paso.” Enlace a Calendario.
- **Sin evaluaciones próximas:** “No hay evaluaciones próximas en este periodo.”
  Acción: crear una evaluación, si el permiso existe.
- **Sin entregas incompletas:** mostrar confirmación positiva, no una tarjeta de
  error.
- **Sin feedback pendiente:** mostrar que el seguimiento está al día. El
  seguimiento debe distinguir sin feedback, feedback generado por IA,
  pendiente de revisión docente, aprobado, publicado al alumno y requiere
  reevaluación.
- **Sin resultados para los filtros:** explicar que no hay trabajo en la
  combinación seleccionada y permitir limpiar filtros; no presentarlo como
  ausencia global de pendientes.
- **Docente sin clases:** orientar a “Configurar mi espacio docente” / “Nueva
  clase”, sin inventar actividad demo.

### Error

- Error de toda la página: conservar navegación y mostrar mensaje accionable,
  causa en lenguaje de usuario y botón “Reintentar”.
- Error de una sección: la cola sana permanece visible; aislar la sección
  fallida con “No pudimos cargar…” y reintento local.
- Timeout o procesamiento: indicar que el trabajo puede seguir en segundo plano,
  último estado conocido y dónde revisar el resultado.
- Error de acción: no borrar la pendiente; anunciar el fallo y permitir
  reintentar sin duplicar la operación.

### Permisos

- Separar las capacidades “puede leer”, “puede preparar”, “puede revisar” y
  “puede aprobar/publicar”.
- Si el docente puede leer pero no ejecutar una acción: conservar el contenido y
  mostrar la acción deshabilitada con explicación textual y alternativa de
  contexto. No simular disponibilidad.
- Si una clase o evaluación no es visible: no mostrar datos parciales que
  revelen existencia; usar el estado autorizado por el contrato.
- Si el permiso cambia mientras la página está abierta: informar el cambio,
  actualizar la acción y no simular éxito.
- El estado “sin permiso” no debe confundirse con “sin pendientes”.

### Datos incompletos

- Mostrar el dato disponible y etiquetar lo faltante: “Periodo pendiente”,
  “Fecha por confirmar” o “Clase sin institución asociada”.
- No inventar institución, fecha, número de estudiantes ni prioridad.
- Una pendiente con datos insuficientes debe explicar qué falta y llevar a la
  acción que lo completa.
- Si el conteo está parcial, usar “Conteo no disponible” en lugar de `0`.

## 9. Requisitos de accesibilidad

- Cumplir WCAG 2.2 AA como objetivo de diseño.
- Usar landmarks `header`, `nav`, `main` y `aside` con nombres accesibles.
- Mantener una secuencia de encabezados: un `h1`, secciones con `h2` y nombres
  claros para cada grupo.
- Cada pendiente debe ser navegable por teclado sin convertir una tarjeta
  completa y sus botones en controles anidados ambiguos.
- El foco visible debe seguir la acción al cambiar de contexto o tras un
  reintento.
- El selector de contexto académico debe tener label y anunciar el alcance
  seleccionado: “Todas mis clases” o una clase específica, institución si
  aplica, periodo, curso/asignatura y sección o grupo si aplica; el menú móvil
  debe gestionar foco y `Escape`.
- Las acciones con icono deben tener nombre accesible. No usar emoji ni iconos
  como único significado.
- Prioridad, estado, error y disponibilidad deben expresarse con texto y no
  solo con color, forma o posición.
- Los skeletons no deben anunciar contenido falso; anunciar el estado de carga
  de la sección cuando corresponda.
- Los cambios de estado y errores deben llegar a una región `status` o `alert`
  apropiada sin robar el foco innecesariamente.
- Respetar zoom, reflow y tamaño de objetivos táctiles; no depender de hover.
- Mantener contraste suficiente para texto, bordes informativos y foco.
- Redactar fechas y cantidades en español de Chile, con formato comprensible y
  sin depender solo de abreviaturas.

## 10. Componentes compartidos reutilizables

La implementación futura debe reutilizar primero los componentes disponibles en
el Design System y sus equivalentes de `adumun/react-components`, según el
paquete/versiones que el proyecto confirme antes de implementar. No se debe
crear una nueva primitive para resolver una necesidad ya cubierta.

| Necesidad | Componente compartido candidato | Uso en WEBUI-001 |
|---|---|---|
| Acción principal/secundaria | `Button` | CTA de cada pendiente y accesos directos |
| Agrupación visual | `Card` | Cola, próximos hitos y seguimiento |
| Estado o prioridad | `Badge`, `Tag` | Prioridad y estado textual |
| Contexto de persona | `Avatar` | Perfil en shell, si aplica |
| Acción compacta | `IconButton` + tooltip | Menú móvil, notificaciones, navegación |
| Iconografía | `LucideIcon` / iconos del sistema | Significado complementario, no único |
| Carga | `Spinner`, `LoadingOverlay`, `ProgressBar` | Estado puntual o procesamiento |
| Feedback | `Toast`, `Dialog` / `ConfirmDialog` | Resultado de acciones y confirmaciones |
| Selector de contexto académico | `Select` o patrón equivalente | “Todas mis clases”, institución opcional, periodo, curso/asignatura y sección o grupo cuando aplique |
| Controles de filtrado futuro | `Input`, `Field` | Solo si el alcance aprobado incorpora búsqueda |

Los componentes de datos como `StatCard` no deben gobernar la composición
principal; podrían usarse únicamente para un dato secundario cuyo valor esté
definido por contrato. Las piezas específicas `WorkQueueSection`,
`WorkQueueItem`, `PriorityLabel` y `ContextSwitcher` son composición de
GradeOps, no nuevas primitivas genéricas del Design System.

## 11. Composición específica de GradeOps

La pantalla combina piezas compartidas con reglas propias del dominio:

```text
AuthenticatedTeacherShell
├── GlobalNavigation
├── GlobalTopbar
└── TeacherHomePage
    ├── AcademicContextHeader
    │   ├── GreetingAndDate
    │   ├── AllClassesContext
    │   └── AcademicContextFilters
    ├── WorkQueueSection
    │   └── WorkQueueItem[]
    ├── UpcomingAssessmentsSection
    ├── FollowUpSection
    │   ├── IncompleteSubmissionsSummary
    │   └── FeedbackStatusSummary
    └── QuickActionsSection
```

### Reglas propias de GradeOps

- “Operaciones” representa qué debe hacer el docente; “Reportes” representa lo
  ocurrido. El Inicio orienta y deriva, no mezcla ambos significados.
- La IA puede explicar una sugerencia o un procesamiento, pero el Inicio nunca
  presenta una propuesta como decisión docente final ni define silenciosamente
  la prioridad de la cola.
- Publicación, calificación, aprobación y entrega de resultados ocurren en el
  contexto correspondiente y requieren la aprobación explícita definida por el
  producto.
- Una misma pendiente puede tener contexto de clase, evaluación, estudiante,
  entrega o recurso; la navegación debe conservar esa ruta.
- El contexto académico inicial es “Todas mis clases” y admite filtros por
  institución opcional, periodo, curso/asignatura y sección o grupo.
- El Inicio no oculta trabajo por la última clase visitada; los filtros solo
  reducen explícitamente la vista actual.
- Los bloques deben admitir crecimiento sin convertir la página en un reporte
  exhaustivo; se muestran cinco pendientes como máximo y “Ver todas en
  Operaciones” es el límite de la cola inicial.

### Discrepancia documentada con la maqueta de referencia

La maqueta actual muestra una navegación reducida con “Panel”, “Evaluaciones”,
“Banco de preguntas”, “Estudiantes” y “Reportes”, además de datos demo. La
arquitectura de información canónica define “Inicio”, “Mis clases”,
“Operaciones”, “Calendario”, “Recursos” y “Reportes”. Para WEBUI-001 prevalece
la arquitectura canónica; la maqueta se usa solo para observar ritmo visual,
uso de tokens y componentes. Esta especificación no modifica la maqueta.

## 12. Datos visibles y contenido

### Datos mínimos por página

| Zona | Datos visibles | Regla de presentación |
|---|---|---|
| Encabezado | nombre del docente, fecha y alcance académico: “Todas mis clases” o una clase específica, con institución opcional, periodo, curso/asignatura y sección o grupo cuando corresponda | Nunca ocultar el contexto académico detrás de un icono; el Inicio puede mostrar una cola agregada de múltiples clases |
| Pendiente | tipo, prioridad, título, clase, evaluación/recurso, razón, fecha, estado | La acción y el motivo deben poder entenderse sin abrir el detalle |
| Próxima evaluación | título, clase, fecha/hora si existe, estado de preparación | Si falta fecha, indicar “fecha por confirmar” |
| Incompletas | cantidad, evaluación/clase, motivo de incompletitud | `0` solo cuando el contrato confirme cero |
| Feedback | cantidad, evaluación/clase, estado de feedback | Distinguir sin feedback, generado por IA, pendiente de revisión docente, aprobado, publicado al alumno y requiere reevaluación |
| Acción directa | verbo, destino y permiso | Ocultar o deshabilitar con explicación, nunca simular disponibilidad |

### Copy orientativo

- Título: “Inicio”.
- Saludo: “Hola, {nombre}”.
- Orientación: “¿Qué necesitas resolver hoy?”.
- Cola: “Qué requiere atención”.
- Horizonte: “Próximas evaluaciones”.
- Seguimiento: “Para mantener al día”.
- Acciones: “Revisar entregas”, “Completar feedback”, “Preparar evaluación”,
  “Ver en Operaciones”.
- Error: “No pudimos cargar estas tareas. Puedes reintentar ahora.”
- Sin datos: “Todavía no hay actividad para mostrar en este contexto.”

Evitar “dashboard”, “pendientes varios”, “gestionar”, “ver más” y estados
internos sin traducción para el docente. El copy final debe validarse contra
los contratos de dominio y el glosario de producto.

## 13. Criterio de validación

El diseño está listo para pasar a una implementación futura cuando una persona
que ejerce como docente pueda, sin explicación del equipo:

1. identificar “Todas mis clases” y aplicar o limpiar cada filtro de contexto;
2. señalar cuál es la primera tarea y explicar su prioridad determinista;
3. abrir una pendiente y llegar al contexto correcto;
4. distinguir los seis estados de feedback sin confundir IA con publicación;
5. encontrar una acción directa sin confundirla con un reporte;
6. interpretar carga, vacío, error, permisos y datos incompletos;
7. completar el flujo con teclado y lector de pantalla en los casos críticos;
8. repetir las tareas en desktop, tablet y móvil sin perder la acción primaria;
9. confirmar que solo se muestran cinco pendientes inicialmente y localizar
   “Ver todas en Operaciones”.

### Evidencia esperada

- recorrido moderado de cinco tareas críticas con docentes o representantes;
- revisión de contenido y terminología en español de Chile;
- comprobación manual de teclado, foco, zoom y reflow;
- revisión de contraste y estados no dependientes del color;
- matriz de datos visibles contra los DTO/read models aprobados;
- registro de cualquier desviación entre arquitectura, diseño y maqueta.

## 14. Decisiones aprobadas

Estas decisiones forman parte del alcance aprobado del Issue #109:

1. La cola usa el orden determinista: bloqueos o vencimientos de hoy,
   acciones próximas a vencer, revisiones solicitadas, feedback pendiente y
   preparaciones futuras. La IA puede sugerir prioridad, pero no definirla
   silenciosamente.
2. El contexto inicial es “Todas mis clases”, con filtros por institución
   opcional, periodo, curso/asignatura y sección o grupo. La última clase
   visitada no oculta trabajo.
3. Las capacidades se separan en puede leer, puede preparar, puede revisar y
   puede aprobar/publicar. Una acción no ejecutable se muestra deshabilitada
   con explicación.
4. Feedback distingue sin feedback, generado por IA, pendiente de revisión
   docente, aprobado, publicado al alumno y requiere reevaluación. Generado por
   IA nunca equivale a publicado.
5. La cola muestra inicialmente como máximo cinco pendientes y ofrece “Ver
   todas en Operaciones”; el Inicio no es una tabla exhaustiva.

## 15. Decisiones técnicas o de dominio pendientes

Las siguientes decisiones no bloquean la aceptación del wireframe, pero deben
resolverse antes o durante la implementación:

1. ¿Se expondrá un endpoint/read model agregado para la cola o se compondrá a
   partir de operaciones separadas?
2. ¿Cómo se serializan en el contrato los motivos, desempates y estados de la
   prioridad determinista?
3. ¿Cómo se persisten y combinan los filtros de “Todas mis clases” entre
   sesiones, sin convertir una clase visitada en contexto inicial?
4. ¿Qué permisos concretos y combinaciones de capacidades implementan las
   cuatro capacidades aprobadas?
5. ¿Qué paquete y versión de `adumun/react-components` son la fuente ejecutable
   para `Button`, `Card`, `Badge`, estados y controles? El checkout revisado no
   contiene una dependencia con ese nombre.
6. ¿Qué datos de próximas evaluaciones son confiables cuando falta fecha,
   ponderación o estado de publicación?
7. ¿Qué acciones directas están permitidas para un docente sin clases o sin
   institución asociada?
8. ¿Qué telemetría de validación se aceptará para medir tiempo hasta la primera
   acción y tasa de apertura del contexto correcto?

## 16. Matriz de decisiones

| Decisión | Estado | Área | ¿Bloquea aceptación visual? | ¿Bloquea implementación? | ¿Requiere decisión humana? |
|---|---|---|---:|---:|---:|
| Orden determinista de la cola | Aprobada | Dominio / API | No | No | No |
| Contexto inicial “Todas mis clases” y filtros | Aprobada | Diseño / dominio | No | No | No |
| Capacidades separadas y acciones deshabilitadas | Aprobada | Dominio / diseño | No | No | No |
| Seis estados explícitos de feedback | Aprobada | Dominio / API | No | No | No |
| Máximo de cinco pendientes y enlace a Operaciones | Aprobada | Diseño / API | No | No | No |
| Endpoint o composición del read model | Pendiente | API | No | Sí | Sí |
| Serialización de prioridad y desempates | Pendiente | API / dominio | No | Sí | Sí |
| Persistencia de filtros | Pendiente | API / dominio | No | Sí | Sí |
| Mapeo concreto de permisos | Pendiente | Dominio / API | No | Sí | Sí |
| Paquete y versión de componentes compartidos | Pendiente | Diseño | No | Sí | Sí |
| Confiabilidad de datos de próximas evaluaciones | Pendiente | Dominio / API | No | Sí | Sí |
| Acciones para docentes sin clases | Pendiente | Dominio / diseño | No | Sí | Sí |
| Telemetría de validación | Pendiente | API / infraestructura | No | Sí | Sí |

## Fuentes revisadas

- [`teacher-workspace-information-architecture.md`](teacher-workspace-information-architecture.md)
- [`webui-design-backlog.md`](webui-design-backlog.md)
- [`../gradeops-ai-frontend-guidelines/00-principios-rectores.md`](../gradeops-ai-frontend-guidelines/00-principios-rectores.md)
- [`../gradeops-ai-frontend-guidelines/03-jerarquia-de-componentes.md`](../gradeops-ai-frontend-guidelines/03-jerarquia-de-componentes.md)
- [`../../design-system/readme.md`](../../design-system/readme.md)
- [`../../src/components/shell/AppShell.tsx`](../../src/components/shell/AppShell.tsx), consultado como referencia de la maqueta actual

La maqueta y los componentes existentes se consultaron únicamente como
referencia. Este documento no modifica `src/`, `data.ts`, la arquitectura de
información ni los 12 Work Items del backlog.

[← Diseño](README.md) · [↑ Volver al inicio](#top)
