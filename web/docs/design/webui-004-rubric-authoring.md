# WEBUI-004 — Rúbricas reutilizables y criterios de evaluación

Estado: Work Unit 4 propuesta para implementación local y revisión humana.
Prerequisito: WEBUI-004 Work Unit 3 — objetivos medibles.
Ruta propuesta: `/preview/assessments/new/rubric`.

## 1. Objetivo

Permitir que el docente construya una rúbrica reutilizable a partir de los objetivos definidos, sin quedar amarrada a una única evaluación, curso o sección.

Una rúbrica puede:

- seleccionarse desde una versión existente;
- duplicarse para crear una nueva versión;
- crearse desde cero;
- recibir una propuesta IA demo;
- editarse y validarse antes de usarse.

La rúbrica define criterios, niveles de logro, descriptores, puntajes, pesos y relación con objetivos. No crea todavía preguntas ni corrige entregas.

## 2. Entrada y salida

Entrada:

- ObjectiveSet local del flujo actual;
- objetivos con evidencia esperada;
- materiales asociados como contexto informativo;
- rúbrica existente opcional;
- permisos de edición.

Salida:

- RubricDraft local;
- criterios definidos;
- niveles configurados;
- pesos válidos o advertencias explícitas;
- criterios vinculados con objetivos;
- estado de readiness para avanzar a preguntas.

La pantalla debe permitir guardar aunque existan advertencias no bloqueantes. Los bloqueos deben indicar qué falta.

## 3. Estructura de la pantalla

### Encabezado

Mostrar:

- “Rúbrica de evaluación”;
- subtítulo que explique que puede reutilizarse;
- progreso de autoría con Propósito y Contenidos/Objetivos completados;
- estado local/demo;
- acción para volver a Objetivos.

### Selección de base

Permitir:

- crear rúbrica nueva;
- seleccionar rúbrica existente;
- duplicar una versión;
- ver nombre, versión, fecha y uso conceptual;
- advertir que editar una copia no modifica la versión original.

### Editor de criterios

Cada criterio debe mostrar:

- nombre;
- descripción;
- objetivo(s) asociado(s);
- peso;
- niveles de logro;
- puntaje por nivel;
- descriptor por nivel;
- estado de completitud.

Acciones:

- agregar criterio;
- editar criterio;
- eliminar criterio;
- reordenar criterios;
- vincular o desvincular objetivos.

### Niveles de logro

La maqueta debe soportar una configuración demo de niveles, por ejemplo:

- Inicial;
- En desarrollo;
- Logrado;
- Sobresaliente.

Cada nivel requiere descriptor y puntaje. La cantidad exacta de niveles debe ser configurable dentro de la maqueta, sin fijarla como contrato backend.

### Propuesta IA

Mostrar una propuesta IA demo claramente separada de la decisión docente.

Debe indicar:

- material u objetivos utilizados;
- fecha demo;
- incertidumbre;
- limitaciones;
- criterios propuestos;
- acciones aceptar, editar o rechazar.

Aceptar no debe publicar ni aprobar la rúbrica automáticamente. Editar convierte la propuesta en borrador humano. Rechazar la elimina del flujo visible.

## 4. Validaciones

Reglas puras:

- nombre de rúbrica requerido para guardar;
- cada criterio debe tener nombre;
- cada criterio debe tener al menos un objetivo o advertir falta de cobertura;
- cada nivel debe tener descriptor;
- puntajes deben ser ordenables y no negativos;
- pesos deben ser válidos;
- la suma de pesos debe marcarse como correcta, incompleta o excedida;
- no permitir criterios duplicados sin advertencia;
- una rúbrica sin criterios no está lista;
- una rúbrica puede guardarse como borrador incompleto.

Distinguir:

- bloqueo: no se puede avanzar a la siguiente etapa;
- advertencia: se puede guardar, pero requiere atención;
- informativo: decisión o limitación de la maqueta.

## 5. Reutilización y versionado

La rúbrica es independiente de AssessmentAssignment. No copiar la rúbrica dentro de cada curso o sección.

La maqueta debe demostrar:

- una rúbrica reutilizable;
- una copia editable;
- una versión anterior preservada;
- edición de copia sin mutación silenciosa;
- vínculo de criterios con objetivos del AssessmentDraft.

El snapshot definitivo usado al publicar queda como UNKNOWN de dominio y no debe inventarse.

## 6. Estados

Cubrir:

- rúbrica vacía;
- rúbrica demo completa;
- criterios incompletos;
- niveles incompletos;
- pesos inválidos;
- objetivos sin criterio;
- loading;
- guardando;
- error de lectura;
- error de guardado;
- retry;
- solo lectura;
- permisos insuficientes;
- propuesta IA pendiente;
- propuesta aceptada;
- propuesta editada;
- propuesta rechazada;
- versión duplicada;
- 404 contextual de la etapa de preguntas futura.

Durante loading o guardado se deshabilitan acciones dependientes y se evita doble envío.

## 7. Navegación

Entradas:

- Objetivos → Rúbrica;
- seleccionar rúbrica desde el flujo;
- crear rúbrica desde estado vacío.

Salidas:

- volver a Objetivos;
- continuar a Preguntas si existe;
- si Preguntas aún no existe, mostrar 404 contextual dentro de AppShell.

No depender de ingreso manual de URL.

## 8. Aceptación visual

- No duplicar AppShell, sidebar, navbar ni drawer.
- Usar componentes DS existentes.
- Layout claro para criterios y niveles.
- Desktop, tablet y teléfono.
- Sin overflow horizontal.
- Tabla o matriz responsive con alternativa apilada en teléfono.
- Acciones primarias con Button centralizado.
- Iconos solo cuando aporten significado.
- CSS Modules, tokens y focus visible.

## 9. Pruebas

Unitarias:

- reglas de criterios;
- niveles;
- pesos;
- cobertura de objetivos;
- readiness;
- duplicación/versionado;
- aceptar/editar/rechazar IA.

Testing Library:

- crear y editar criterio;
- agregar nivel;
- asociar objetivo;
- guardar;
- error/retry;
- solo lectura;
- permisos;
- estados IA.

Playwright:

- navegación desde Objetivos;
- crear rúbrica;
- agregar criterio;
- configurar niveles;
- mostrar advertencias;
- aceptar/editar/rechazar propuesta;
- duplicar versión;
- volver a Objetivos;
- 404 contextual de Preguntas;
- cinco viewports;
- sin overflow.

## 10. UNKNOWN

No resolver en esta Work Unit:

- contrato backend;
- endpoints;
- persistencia definitiva;
- permisos reales;
- snapshot al publicar;
- reglas institucionales;
- equivalencias de escalas;
- integración IA real;
- corrección automática;
- preguntas;
- asignaciones y publicación.
