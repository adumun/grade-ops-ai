# Flujo docente para crear evaluaciones

Estado: diseño funcional preliminar, listo para revisión humana y maquetación incremental.
Alcance: WEBUI-004 (propuesto). Este documento define el flujo y las pantallas; no constituye contrato API ni modelo backend definitivo.

## 1. Propósito

Llevar al docente desde “no tengo evaluaciones configuradas” hasta una evaluación reutilizable, revisada y lista para asignarse a uno o más cursos, asignaturas, secciones o grupos.

La creación no queda amarrada a un grupo. La evaluación es un instrumento autoral; su aplicación se modela después como una asignación. El mismo conjunto de contenidos puede alimentar varias evaluaciones y una misma rúbrica puede reutilizarse o versionarse.

La IA propone. El docente decide. Toda propuesta automática permanece en borrador hasta una confirmación explícita.

## 2. Entrada sin datos

Ruta propuesta: `/preview/assessments`.

Si no hay ContentSet, ObjectiveSet, Rubric ni Assessment, mostrar un estado vacío orientado a la acción:

- acción principal: “Crear mi primera evaluación”;
- acción secundaria: “Crear conjunto de contenidos”;
- acción terciaria: “Importar materiales”;
- guía breve del flujo;
- explicación de que cursos, secciones y alumnos se eligen al asignar, no al comenzar.

No mostrar filtros de clases o colas sin datos. No presentar fixtures como información real. El borrador debe poder guardarse y retomarse.

## 3. Flujo principal

Cada etapa es independiente, guardable y testeable:

1. Propósito de la evaluación.
2. Contenidos y materiales.
3. Objetivos medibles.
4. Rúbrica.
5. Preguntas y evidencias esperadas.
6. Configuración de corrección y feedback.
7. Revisión de coherencia.
8. Guardar como borrador.
9. Asignar a uno o más contextos académicos.
10. Fechas, ponderaciones e instrucciones por asignación.
11. Publicar o abrir la evaluación.
12. Recibir y revisar entregas.

El usuario puede avanzar, volver, abandonar y retomar sin perder el estado confirmado.

## 4. Pantallas y contratos de navegación

### 4.1 Propósito

Ruta: `/preview/assessments/new/purpose`.

Entrada: nueva evaluación o borrador existente.
Contenido: nombre/título, propósito pedagógico, temática, nivel de profundidad, tipo de evaluación y resultado esperado.
Acciones: guardar borrador, continuar a contenidos, volver al inicio.
Salida: AssessmentDraft con propósito parcial.
Bloqueos: título vacío; propósito ausente solo debe advertirse, no necesariamente impedir guardar.
Pruebas: render vacío, edición, persistencia, loading, error, retry y navegación.

### 4.2 Contenidos y materiales

Ruta: `/preview/assessments/new/content`.

ContentSet independiente y reutilizable. Admitir PDF, PPTX, DOCX, imágenes, enlaces, texto y notas; el límite real de formatos queda pendiente del backend.

Cada material muestra nombre, tipo, tamaño si existe, estado de extracción, origen, fecha y problemas detectados. El docente puede agregar, retirar, reemplazar, ordenar y reutilizar materiales.

La IA puede resumir, detectar conceptos, proponer objetivos o señalar vacíos, pero debe mostrar fuentes y estado de incertidumbre.

Acciones: guardar, importar, revisar extracción, pedir propuesta IA, continuar a objetivos.
Pruebas: lista vacía, material cargado, extracción pendiente, error, retry, material no compatible y permiso de solo lectura.

### 4.3 Objetivos medibles

Ruta: `/preview/assessments/new/objectives`.

Permitir crear objetivos manualmente, editar texto, indicar evidencia observable y relacionar objetivos con contenidos. La IA puede proponer objetivos a partir del ContentSet.

Cada propuesta debe poder aceptarse, editarse o rechazarse individualmente. Mostrar origen, material usado, fecha e incertidumbre.

Salida: ObjectiveSet versionable y cobertura preliminar.
Reglas: no permitir publicar una evaluación con objetivos inexistentes; advertir objetivos sin evidencia o sin preguntas asociadas.

### 4.4 Rúbrica

Ruta: `/preview/assessments/new/rubric`.

Permitir seleccionar una rúbrica existente, crear una nueva o versionar una anterior. Definir criterios, niveles, descriptores, puntajes, pesos y vínculo con objetivos.

La rúbrica debe poder reutilizarse en otra evaluación sin mutar silenciosamente la versión anterior. El snapshot exacto que se usa al publicar queda como decisión pendiente de dominio.

Acciones: crear, duplicar, editar, pedir propuesta IA, validar, guardar.
Pruebas: criterios incompletos, pesos inválidos, niveles faltantes, solo lectura, error y retry.

### 4.5 Preguntas y evidencias

Ruta: `/preview/assessments/new/questions`.

Permitir agregar preguntas de selección, respuesta breve, desarrollo, archivo, código u otros tipos compatibles con la evaluación. Cada pregunta declara objetivo(s), evidencia esperada, puntaje, instrucciones, material de apoyo y criterio de corrección.

La IA puede generar un borrador de preguntas. El docente debe revisar cada una, editarla, aceptarla o eliminarla. No se debe confundir evidencia de una respuesta con “evidencia IA”: evidencia es lo que el alumno debe producir y la evidencia técnica es el rastro que respalda una sugerencia.

### 4.6 Corrección y feedback

Ruta: `/preview/assessments/new/grading`.

Definir si la corrección es manual, asistida por IA o mixta; qué criterios puede sugerir la IA; qué requiere confirmación docente; escalas de puntaje; comentario por pregunta; feedback global; reglas de reevaluación y publicación.

Aprobación y publicación son operaciones separadas. La IA nunca publica ni transforma una sugerencia en calificación definitiva.

### 4.7 Revisión de coherencia

Ruta: `/preview/assessments/new/review`.

Mostrar resumen de propósito, materiales, objetivos, rúbrica, preguntas, cobertura, puntajes y reglas. Agrupar advertencias por severidad:

- bloqueo: falta un elemento obligatorio;
- advertencia: incoherencia que el docente puede corregir;
- informativo: decisión pendiente o limitación de la maqueta.

Acciones: corregir sección, guardar borrador, marcar lista para asignar.

### 4.8 Asignación

Ruta: `/preview/assessments/[assessmentId]/assign`.

La asignación selecciona institución opcional, período, curso/asignatura y sección/grupo. Una evaluación puede tener varias asignaciones, cada una con fecha, ponderación, instrucciones y estado propio.

No copiar datos de asignación dentro del instrumento. Mostrar claramente qué se reutiliza y qué cambia por destino.

### 4.9 Publicación

Ruta: `/preview/assessments/[assessmentId]/publish`.

Resumen final por asignación, alumnos alcanzados, fechas, ponderación y permisos. Requiere confirmación explícita. Publicar una asignación no debe publicar automáticamente otras.

## 5. Estados comunes

Cada módulo soporta: inicial, loading, guardando, guardado, vacío, error recuperable, retry, solo lectura, permiso insuficiente, propuesta IA pendiente, propuesta aceptada, propuesta rechazada y datos desactualizados.

Los botones dependientes de datos se deshabilitan durante loading. El estado debe explicar por qué una acción no está disponible.

## 6. Modelo conceptual preliminar

- ContentSet: materiales y conocimiento reutilizable.
- Material: archivo, enlace, texto o nota y su extracción.
- ObjectiveSet / Objective: objetivos y evidencias esperadas.
- Rubric / RubricVersion / Criterion / Level.
- Assessment: instrumento compuesto.
- Question / EvidenceExpectation / GradingRule.
- AssessmentAssignment: aplicación a un contexto.
- Submission: respuesta de un alumno.
- Review: revisión y decisión docente.
- AIFinding / AISuggestion: propuesta, origen, confianza, incertidumbre y estado humano.

Estos nombres son conceptuales hasta conciliarlos con el modelo existente.

## 7. Reutilización y composición

Reutilizar AppShell, navegación, drawer, Page, PageHeader, PageSection, tarjetas, badges, botones, campos, overlays, estados y patrones de feedback existentes.

Componer páginas con secciones de propósito, materiales, objetivos, rúbrica, preguntas, corrección y progreso. Crear componentes nuevos solo cuando expresen una responsabilidad reusable: MaterialUploader, ObjectiveBuilder, RubricEditor, QuestionBuilder, AssignmentContextSelector, ReadinessSummary.

No crear componentes ligados a un caso demo o a una sola evaluación.

## 8. Criterios de aceptación de la maqueta

- El flujo se puede recorrer sin backend.
- Fixtures son deterministas y explícitamente demo.
- Cada etapa tiene ruta, entrada, salida, estado vacío, loading, error, retry y permisos.
- Se puede guardar y retomar un borrador local.
- Se puede reutilizar contenido y rúbrica en más de una evaluación.
- Se pueden simular varias asignaciones sin duplicar el instrumento.
- Las propuestas IA muestran origen, incertidumbre y decisión humana.
- El responsive no crea overflow horizontal.
- La navegación conserva contexto y permite volver sin perderlo.
- Jest/Testing Library cubre reglas y comportamiento; Playwright cubre navegación y smoke visual.
- No se inventa un contrato backend cuando la evidencia no existe.

## 9. Decisiones pendientes

Formatos definitivos, extracción, almacenamiento, proveedor IA, permisos, versionado, snapshot de rúbrica, calendario académico, reglas de ponderación, equivalencia entre instituciones, límites de archivos, persistencia local y endpoints quedan marcados como UNKNOWN hasta su conciliación.

La primera implementación debe elegir un único módulo vertical, preferentemente la entrada sin datos y propósito, y no construir todo el flujo de una vez.
