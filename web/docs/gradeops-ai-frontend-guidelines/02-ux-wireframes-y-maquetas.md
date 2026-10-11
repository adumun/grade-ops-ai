# 02 — UX, wireframes y maquetas funcionales

## 1. Antes del código: entender la tarea

Toda pantalla debe comenzar con una respuesta clara:

- ¿Quién usa esto?
- ¿Qué quiere lograr?
- ¿Qué información necesita para decidir?
- ¿Qué acción principal debe tomar?
- ¿Qué riesgo existe si se equivoca?
- ¿Qué datos vienen del backend?
- ¿Qué estados alternativos existen?

Para GradeOps AI, el usuario principal es un docente con tiempo limitado. La UI debe reducir carga cognitiva, no impresionar visualmente.

## 2. Flujo mínimo de diseño

Para una feature visible, seguir este orden:

1. Definir objetivo de usuario.
2. Escribir flujo principal en pasos.
3. Identificar estados secundarios.
4. Hacer wireframe de baja fidelidad.
5. Definir jerarquía de componentes.
6. Crear maqueta funcional con datos fake si el flujo es nuevo.
7. Validar copy, densidad y acciones.
8. Conectar API real.
9. Agregar pruebas.

El wireframe puede ser texto, Markdown, Figma, captura o HTML simple. Lo importante es decidir antes de codificar.

## 3. Wireframe textual recomendado

Formato simple:

```md
## Pantalla: Evaluaciones

Usuario: docente autenticado.
Objetivo: encontrar evaluaciones abiertas y revisar pendientes.

Layout:
- AppShell protegido.
- Header: título, subtítulo, acción primaria.
- Section: resumen de métricas.
- Section: filtros y búsqueda.
- Section: tabla/lista de evaluaciones.

Acción primaria:
- Nueva evaluación.

Estados:
- Loading: skeleton de métricas y lista.
- Empty: CTA para crear primera evaluación.
- Error: retry + mensaje claro.
- Sin permisos: explicación + contacto/admin.
```

## 4. Maqueta funcional

Una maqueta funcional es una implementación navegable que permite validar:

- Jerarquía visual.
- Densidad de información.
- Flujo de clicks.
- Estados loading/empty/error.
- Responsive.
- Microcopy.
- Composición de componentes.

Puede usar datos fake y no necesita backend real. Pero debe ser suficientemente cercana al producto final para detectar problemas de UX.

## 5. Cuándo exigir maqueta funcional

Debe existir maqueta funcional cuando:

- Es una pantalla nueva.
- Cambia un flujo crítico.
- Tiene formularios multi-step.
- Contiene revisión/aprobación humana.
- Muestra resultados generados por IA.
- Combina filtros, listas y acciones masivas.
- Tiene visualización de datos.
- El backend aún no está listo.

Puede omitirse cuando:

- Es una corrección visual menor.
- Es una pantalla placeholder.
- Es un cambio interno sin impacto UI.
- Es una variante ya cubierta por un patrón existente.

## 6. Datos fake con intención

Los datos fake deben cubrir casos reales:

- Títulos largos.
- Nombres con acentos.
- Estados distintos.
- Fechas vencidas y futuras.
- Cero elementos.
- Muchos elementos.
- Errores parciales.
- Texto generado por IA largo.
- Permisos restringidos.

Evitar mocks perfectos con tres tarjetas simétricas. Esos mocks no prueban la UI.

## 7. Jerarquía visual

Cada pantalla debe tener:

- Un objetivo principal reconocible.
- Una acción primaria clara.
- Acciones secundarias con menor peso.
- Información crítica visible sin scroll excesivo.
- Estados y etiquetas comprensibles.
- Agrupaciones por tarea, no por tipo técnico.

No todas las pantallas necesitan hero, ilustraciones o grandes cards. En un producto operativo, la densidad organizada suele ser mejor que una composición decorativa.

## 8. Microcopy

El texto de UI debe ser:

- Concreto.
- Breve.
- Orientado a acción.
- Consistente en tono.
- En español claro para docentes.

Preferir:

- "Crear evaluación"
- "No hay entregas por revisar"
- "Tu sesión expiró. Inicia sesión de nuevo."

Evitar:

- "Submit"
- "Oops"
- "Algo salió mal" como único detalle.
- Mensajes técnicos del backend sin traducción.

## 9. Estados de aprobación humana

En flujos con IA, la UI debe hacer explícito:

- Qué fue generado por IA.
- Qué está pendiente de revisión humana.
- Qué fue aprobado.
- Qué fue editado por el docente.
- Qué se publicará al estudiante.
- Qué no se puede deshacer.

El humano conserva autoridad pedagógica. La interfaz debe reflejarlo.

## 10. Resultado esperado del diseño

Antes de implementar contra API real, debe existir una respuesta para:

- Componentes necesarios.
- Hooks necesarios.
- DTOs requeridos.
- Estados de UI.
- Validaciones.
- Eventos de usuario.
- Tests mínimos.
- Riesgos de UX.


## 11. Estándar de documentación antes de implementar

Toda feature nueva debe tener un paquete documental revisable antes de abrir su Work Unit de código. No basta con una captura o una frase como “implementar esta pantalla”.

El paquete debe definir:

- objetivo del usuario y problema que resuelve;
- flujo completo, entradas, salidas, retornos y navegación;
- pantallas, rutas y acciones;
- estados inicial, vacío, loading, guardando, éxito, error, retry, solo lectura y permisos;
- datos necesarios y modelo conceptual preliminar;
- decisiones confirmadas, pendientes y UNKNOWN;
- qué se reutiliza, qué se compone y qué componentes React serían nuevos;
- responsive, accesibilidad, copy y criterios de aceptación visual;
- pruebas deterministas, smoke visual y gates Make;
- límites de la maqueta y decisiones que pertenecen al backend.

La documentación debe dividir el flujo en Work Units independientes. Cada Work Unit necesita entrada, salida, persistencia, navegación, estados, permisos, componentes, pruebas y aceptación propios. No debe depender de que todo el flujo esté construido para poder demostrarse.

## 12. Guía para el implementador

El paquete debe incluir una guía explícita para Codex o la persona desarrolladora:

- Route/Page TSX: params, composición y navegación;
- Page Hook: orquestación de pantalla;
- hooks de dominio: operaciones del producto;
- reglas puras: validaciones testeables sin React;
- hooks de acceso a datos: abstracción de la fuente;
- data sources: fixture, localStorage o API;
- componentes presentacionales: props y eventos, sin acceso directo a datos.

Si una decisión no está resuelta, debe permanecer visible como UNKNOWN. El implementador no debe inventar contratos ni convertir una limitación de la maqueta en una decisión de producto.

## 13. Revisión previa obligatoria

La revisión humana aprueba el paquete documental antes de crear el worktree de implementación. Después se implementa una Work Unit, se ejecutan los gates deterministas y se hace revisión visual. Si el código descubre una contradicción, se actualiza la documentación y se registra el cambio.

