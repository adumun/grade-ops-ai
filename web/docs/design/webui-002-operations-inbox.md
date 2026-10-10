# WEBUI-002 — Bandeja de Operaciones

Estado: propuesta de diseño pendiente de revisión humana

Superficie de maqueta: `/preview/operations`

Perfil: `local-preview`
Fecha: 2026-10-10

## 1. Objetivo y límites

La maqueta permite a una docente encontrar rápidamente el siguiente trabajo operativo, entender su contexto y abrir la acción adecuada sin perder el alcance académico seleccionado.

Incluye cuatro colas separadas:

- **Preparar:** trabajo previo a publicar o iniciar una evaluación.
- **Revisar:** entregas, resultados o feedback que requieren inspección.
- **Confirmar:** propuestas o cambios que necesitan una decisión docente antes de avanzar.
- **Aprobar:** salidas generadas o editadas que requieren aprobación humana explícita.

La superficie es demostrativa: usa datos locales deterministas, simula acciones y navegación contextual, y no llama API, Firebase, Gemini, servicios remotos ni credenciales. No se presentan entidades backend ni contratos API como implementados.

Se conserva `/preview` como la maqueta de WEBUI-001. La bandeja se expone en una ruta local propia para que ambas superficies puedan validarse sin reemplazarse.

## 2. Flujo principal

1. La docente abre la bandeja y ve el contexto académico global, el resumen de pendientes y las cuatro colas.
2. Selecciona clase, asignatura, estado y fecha, o busca por texto. Clase y asignatura permanecen como filtros separados porque representan dimensiones académicas distintas; la UI usa esos mismos labels en filtros, placeholders y estados.
3. Revisa la razón, estado, fecha y origen de una fila.
4. Ejecuta la acción primaria de la fila.
5. La maqueta muestra loading localizado, resultado o error recuperable; mantiene filtros, búsqueda y cola activa.
6. `Ver contexto` lleva al destino simulado de origen y muestra un retorno explícito a la bandeja conservando el contexto.

La acción de la UI representa intención de producto solamente. No aprueba, publica, recalcula ni persiste una decisión real.

## 3. Layout y responsive

### Desktop — desde 1200 px

```text
AppShell: sidebar 238 px | topbar
┌────────────────────────────────────────────────────────────────────┐
│ Navegación │ Bandeja de Operaciones              búsqueda / perfil │
│            │ título + contexto + resumen                         │
│            │ búsqueda · clase/asignatura · estado · fecha         │
│            │ [Preparar] [Revisar] [Confirmar] [Aprobar]            │
│            │ lista densa de filas con acción primaria              │
└────────────────────────────────────────────────────────────────────┘
```

Las colas se muestran como tabs/segmentos accesibles, una activa a la vez. El resumen de las cuatro colas permanece visible arriba para poder comparar carga sin duplicar listas.

### Tablet — 641–1199 px

- Sidebar colapsa a rail de iconos usando el patrón existente de WEBUI-001.
- El contenido pasa a una columna.
- Filtros se organizan en dos columnas y búsqueda ocupa una fila completa.
- La fila conserva título, contexto, estado, fecha y acción; el destino puede pasar a una línea secundaria.

### Teléfono — hasta 640 px

- Sidebar se convierte en drawer accesible con botón, overlay, Escape y retorno de foco.
- Header conserva menú, búsqueda y perfil resumido.
- Resumen de colas se convierte en cuatro tarjetas compactas desplazables horizontalmente sin overflow de la página.
- Filtros se apilan; la búsqueda queda antes de las colas.
- Cada fila se convierte en bloque vertical: prioridad/estado, título/contexto, fecha/razón y acción primaria full-width; acciones secundarias quedan en menú o enlace contextual.
- No se usa tabla horizontal para el contenido operativo.

El contenedor raíz debe bloquear overflow horizontal accidental y permitir scroll vertical en el área de contenido, igual que WEBUI-001.

## 4. Jerarquía de componentes

```text
LocalPreviewLayout / AppShell existente
  OperationsInboxPage
    OperationsInboxHeader
      AcademicContextBar
      InboxSummary
    OperationsToolbar
      SearchField
      ContextFilterGroup
      ActiveFilterSummary
    OperationsQueueSection
      QueueSwitcher
      QueueList
        OperationRow
          OperationPriority
          OperationStatus
          OperationContext
          OperationRowActions
    ContextReturnNotice
    DemoStateControl (solo local-preview)
```

Responsabilidades:

- `OperationsInboxPage`: compone la ruta y consume el hook principal; no contiene mapeos extensos ni lógica de filtros inline.
- `useOperationsInbox`: estado de cola activa, filtros, búsqueda, loading/error de carga, acción por fila, retry y contexto de retorno.
- `OperationsQueueSection`: presenta una cola y sus estados locales.
- `OperationRow`: componente reutilizable para cualquier cola; recibe una operación genérica, no un nombre amarrado a una pantalla.
- `OperationsToolbar`: controles de búsqueda y filtros; no conoce contratos backend.
- `ContextReturnNotice`: comunica origen, destino simulado y preservación del contexto.

Se reutilizan `Button`, `Badge`, `Card`, `Input`, `Select`, `IconButton`, `LucideIcon` y tokens del Design System, además del `AppShell`/drawer y convenciones de WEBUI-001. No se crea un componente visual nuevo si una pieza existente cubre el caso.

## 5. Modelo de datos demo

Los fixtures viven en un archivo TypeScript nuevo dentro de la feature de operaciones. `web/src/features/teacher-operations-mock/data.ts` no se modifica salvo que una dependencia estricta lo haga inevitable.

```ts
type OperationsQueue = "prepare" | "review" | "confirm" | "approve";
type DemoOperationState = "ready" | "loading" | "empty" | "error" | "readonly";

interface DemoOperation {
  id: string;
  queue: OperationsQueue;
  title: string;
  context: string;
  className: string;
  subject: string;
  status: string;
  dueDate: string;
  dueDateIso: string;
  reason: string;
  primaryAction: string;
  originLabel: string;
  originPath: string;
  priority: "urgent" | "next" | "normal";
  access: "editable" | "read-only";
}
```

Los datos deben cubrir: al menos dos filas por cola; título largo; acentos; fecha vencida, hoy y futura; estados IA, revisión docente, bloqueado y listo; una fila solo lectura; un conjunto filtrado vacío; una acción que falla una vez y permite reintentar; y destinos de origen distintos. El orden de los fixtures será explícito y estable, sin `Math.random`, reloj del sistema ni datos generados.

## 6. Estados visuales

| Estado | Comportamiento visible |
|---|---|
| Carga inicial | Skeleton de resumen, tabs y filas; controles dependientes deshabilitados; navegación global disponible. |
| Carga de acción | Solo la fila afectada muestra spinner/`loading`; la cola, filtros y contexto permanecen visibles. |
| Vacío global | Mensaje: no hay operaciones pendientes; explica siguiente paso y ofrece limpiar filtros/ver todas las colas. |
| Vacío filtrado | Indica que no hay coincidencias para búsqueda/filtros y permite limpiar filtros. |
| Error de carga | `role=alert`, causa traducida, retry; conserva toolbar y contexto seleccionado. |
| Error de acción/reintento | Error junto a la fila; botón Reintentar; no salta de cola ni borra búsqueda/filtros. |
| Solo lectura | Fila visible y navegable; acción primaria deshabilitada con explicación “Solo lectura”; `Ver contexto` sigue disponible. |
| Permiso insuficiente | Aviso de alcance/permisos en la sección; no se simula autorización real ni se oculta la evidencia de la fila. |
| Datos parciales | Cola disponible permanece visible; bloque incompleto muestra aviso y retry independiente. |
| Contexto preservado | Tras acción exitosa, error o retry se mantienen cola activa, búsqueda, filtros y fecha; el retorno desde origen muestra esos valores. |

Los estados no dependen solo del color: llevan texto, icono y semántica accesible. IA, revisión humana, aprobación y publicación se distinguen explícitamente.

## 7. Accesibilidad y usabilidad

- Tabs usan `role=tablist`, `role=tab`, `aria-selected` y `aria-controls`; el panel activo usa `role=tabpanel`.
- Búsqueda y filtros tienen labels visibles o asociados; estado y error se anuncian con `role=status`/`role=alert`.
- Las acciones de fila son botones; el origen se representa como navegación/enlace.
- El foco retorna al disparador después de cerrar el drawer.
- El texto largo hace wrap; los contenedores flex usan `min-width: 0`.
- La acción primaria es identificable por texto y no solo por color.
- Contraste, foco visible, teclado, Escape y targets táctiles siguen las guías frontend.

## 8. Criterios de aceptación

1. Existe `/preview/operations` y renderiza sin API, Firebase ni credenciales bajo `local-preview`.
2. La docente puede cambiar entre Preparar, Revisar, Confirmar y Aprobar, y cada cola muestra datos deterministas propios.
3. La búsqueda filtra por título, contexto, clase, asignatura y estado sin alterar el orden original.
4. Los filtros por clase/asignatura, estado y fecha se combinan con búsqueda y pueden limpiarse.
5. Cada fila tiene una acción primaria contextual; una acción simulada muestra feedback y conserva el contexto de trabajo.
6. `Ver contexto` muestra el origen simulado y permite volver sin perder cola, búsqueda ni filtros.
7. Se pueden demostrar carga inicial, vacío global, vacío filtrado, error, error de acción/retry, solo lectura y permiso restringido.
8. Desktop, tablet y teléfono no presentan overflow horizontal; el drawer móvil es navegable por teclado.
9. La implementación reutiliza DS/shell existentes, no cambia `data.ts` existente sin necesidad y no inventa contratos backend.
10. Tests deterministas cubren filtros, búsqueda, cambio de cola, acción/retry, preservación de contexto y estados principales; smoke visual cubre ruta, responsive y overflow.

## 9. Pruebas previstas

### Jest + Testing Library

- Render inicial con las cuatro colas y conteos.
- Cambio de cola con `role=tab` y panel correcto.
- Búsqueda y combinación de filtros; limpieza restaura fixture.
- Acción primaria: loading localizado, éxito y preservación de contexto.
- Error de acción: retry vuelve a la misma fila/cola y mantiene controles.
- Render de loading, vacío, error, solo lectura, permiso restringido y datos parciales.
- Navegación simulada al contexto y retorno con filtros intactos.
- Labels, roles, `aria-selected`, `aria-controls`, `aria-busy` y `role=alert`.

### Smoke visual Playwright

- `/preview/operations` responde 200 y contiene las cuatro colas.
- Viewports desktop, tablet y teléfono; sin `document.documentElement.scrollWidth > innerWidth`.
- Toolbar usable, tabs cambiables y búsqueda visible.
- Drawer móvil abre/cierra con botón, overlay y Escape.
- Acción y retry mantienen la cola activa y el contexto.
- Capturas de referencia de desktop/teléfono para revisión visual, sin afirmar que equivalen a una aprobación de diseño.

## 10. Verificación y límites de la fase

Después de implementar se ejecutará, desde la raíz:

```bash
make validate WEB_PROFILE=local-preview
make preview-smoke
git diff --check
```

También se levantará el preview local para inspección visual y se comprobarán manualmente responsive, overflow, filtros, búsqueda, estados y navegación. Si alguna validación queda bloqueada por entorno (por ejemplo, Chromium ausente), se reportará con su causa y no se convertirá en éxito artificial.

No se hará commit, push ni PR en esta fase. La documentación y el diff deben revisarse antes de comenzar la implementación.
