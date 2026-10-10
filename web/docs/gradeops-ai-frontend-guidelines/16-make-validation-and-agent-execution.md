<a id="top"></a>

# WEBUI-001 — Estandarizar validación frontend con Make

## Propósito

Este documento es una instrucción ejecutable para Codex CLI. Su objetivo es incorporar al repositorio el estándar de validación determinista del frontend y dejarlo documentado para futuras features de WebUI.

La implementación debe realizarse en la rama:

\`feat/teacher-operations-console-preview\`

La rama debe partir del \`develop\` actualizado, que ya contiene el preview de Inicio docente integrado.

Este trabajo es de gobernanza y automatización de desarrollo. No debe rediseñar ni modificar la maqueta visual de WEBUI-001.

## Fuentes que deben respetarse

La especificación se contrastó con:

- Google Drive: documento “GradeOps AI — Backlog de diseño WebUI”.
- Repositorio: \`AGENTS.md\`.
- Repositorio: \`RULES.md\`.
- Repositorio: \`web/README.md\`.
- Repositorio: \`web/docs/gradeops-ai-frontend-guidelines/README.md\`.
- Repositorio: \`web/docs/gradeops-ai-frontend-guidelines/10-testing-calidad-y-automatizacion.md\`.
- Repositorio: \`web/docs/gradeops-ai-frontend-guidelines/14-checklists.md\`.
- Repositorio: \`web/package.json\`.

## Hallazgo confirmado

Actualmente:

- no existe \`Makefile\` en la raíz;
- no existe \`web/Makefile\`;
- \`AGENTS.md\` prescribe comandos directos de npm;
- la guía frontend prescribe \`npm run lint\`, \`npm run test\` y \`npm run build\`;
- existe \`npm run test:e2e\`, pero no está envuelto por Make;
- existen scripts E2E en \`scripts/\`, pero requieren servicios, Docker, credenciales y configuración externa;
- no existe un quality gate frontend canónico ejecutable como \`make web-validate\`.

## Objetivo técnico

Crear un wrapper Make en la raíz del repositorio para que el flujo frontend tenga una puerta de entrada estable, explícita y auditable.

Los objetivos mínimos son:

\`\`\`text
make web-lint
make web-test
make web-build
make web-validate
\`\`\`

El smoke E2E debe permanecer separado:

\`\`\`text
make web-smoke
\`\`\`

No debe ejecutarse automáticamente como parte de \`web-validate\` mientras dependa de servicios externos, credenciales, Firebase real, Docker o estado no controlado.

## Archivos esperados

Crear o modificar únicamente los archivos necesarios:

- \`Makefile\`
- \`AGENTS.md\`
- \`web/README.md\`
- \`web/docs/gradeops-ai-frontend-guidelines/README.md\`
- \`web/docs/gradeops-ai-frontend-guidelines/10-testing-calidad-y-automatizacion.md\`
- \`web/docs/gradeops-ai-frontend-guidelines/14-checklists.md\`
- el \`README.md\` de la carpeta directa si las reglas de \`RULES.md\` lo exigen para cualquier carpeta nueva.

No modificar:

- \`data.ts\`;
- componentes de la maqueta;
- rutas visuales;
- contratos API;
- dependencias npm;
- archivos generados;
- \`.github/copilot-instructions.md\`;
- cambios locales ajenos al alcance.

## Diseño del Makefile

El \`Makefile\` debe:

1. usar objetivos declarados en \`.PHONY\`;
2. ejecutar los comandos desde \`web/\` sin depender del directorio actual del usuario;
3. fallar si falla cualquiera de los comandos subyacentes;
4. no ocultar errores;
5. no instalar dependencias automáticamente;
6. no modificar archivos;
7. no requerir interacción humana;
8. documentar sus precondiciones;
9. mantener los comandos tecnológicos definidos en \`web/package.json\` como fuente de verdad operativa;
10. evitar duplicar lógica compleja dentro de Make.

Los objetivos deben tener esta semántica:

### \`web-install-check\`

Comprobar que existen \`web/package.json\` y el lockfile esperado. No ejecutar una instalación automática. Si faltan dependencias, fallar con un mensaje accionable.

### \`web-lint\`

Ejecutar el lint oficial del frontend desde \`web/\`.

Comando tecnológico esperado:

\`\`\`bash
npm run lint
\`\`\`

### \`web-test\`

Ejecutar la suite determinista de Jest del frontend en modo no interactivo.

Debe:

- terminar por sí sola;
- no entrar en watch mode;
- devolver código distinto de cero ante fallos;
- conservar mocks existentes;
- permitir que el resultado sea reproducible en CI.

Comando tecnológico esperado:

\`\`\`bash
npm run test -- --runInBand
\`\`\`

Si el repositorio tiene una convención distinta ya documentada, conservarla y explicarla. No inventar una suite nueva.

### \`web-build\`

Ejecutar el build oficial:

\`\`\`bash
npm run build
\`\`\`

Si el build falla por Firebase o configuración externa existente, no ocultar el fallo. Documentar exactamente la causa y distinguir:

- error del cambio;
- falta de configuración local;
- bloqueo preexistente del repositorio.

### \`web-validate\`

Ser el quality gate determinista del frontend. Debe ejecutar, en orden claro:

1. \`web-install-check\`;
2. \`web-lint\`;
3. \`web-test\`;
4. \`web-build\`.

No incluir \`web-smoke\` por defecto.

Si el build no puede pasar localmente por una precondición conocida, el resultado debe quedar documentado en la salida del agente y en el PR. No convertir el fallo en éxito artificial.

### \`web-smoke\`

Envolver solamente el smoke E2E frontend existente y documentar sus precondiciones. No ejecutarlo como parte de \`web-validate\`.

Debe quedar claro si usa:

- servidor local;
- Playwright;
- Docker;
- Firebase;
- API o agentes;
- credenciales;
- variables de entorno.

Si el smoke de la maqueta \`/preview\` no tiene un test automatizado estable, no inventar un falso wrapper. Registrar la brecha para una tarea posterior.

## Pruebas deterministas de la maqueta

Para WEBUI-001, verificar si ya existen tests de comportamiento para:

- render de la cola;
- máximo de cinco pendientes;
- prioridades;
- filtros;
- estados de carga, vacío y error;
- apertura y cierre del drawer;
- cierre por botón;
- cierre por overlay;
- cierre por Escape;
- \`aria-expanded\`;
- \`aria-controls\`;
- responsive no debe depender de snapshots frágiles.

Si falta cobertura determinista para una interacción lógica del drawer o de la cola, crear tests con Jest + Testing Library. Preferir:

\`\`\`ts
screen.getByRole(...)
screen.getByLabelText(...)
screen.getByText(...)
\`\`\`

Evitar selectores por clases internas y \`data-testid\` cuando exista una alternativa semántica.

Las propiedades puramente CSS como columnas, gaps, \`position: fixed\` o media queries deben validarse mediante smoke visual o Playwright si existe infraestructura estable. No fingir que Jest valida el layout real del navegador.

## Actualización documental obligatoria

Actualizar la documentación para que no existan dos estándares contradictorios.

### \`AGENTS.md\`

Agregar una sección de comandos canónicos de validación frontend que indique:

- \`make web-lint\`;
- \`make web-test\`;
- \`make web-build\`;
- \`make web-validate\`;
- \`make web-smoke\` como flujo separado;
- npm directo solo como diagnóstico o ejecución interna del wrapper.

### \`web/README.md\`

Actualizar “Available Scripts” o agregar una sección “Quality gates” explicando:

- cómo ejecutar validación canónica;
- cómo ejecutar lint y tests individuales;
- diferencia entre validación determinista y smoke E2E;
- precondiciones del build;
- cómo documentar bloqueos ambientales.

### \`10-testing-calidad-y-automatizacion.md\`

Mantener Jest + Testing Library como stack y agregar que:

- el punto de entrada canónico es Make;
- los comandos npm son la implementación tecnológica subyacente;
- \`web-validate\` no incluye E2E externo;
- un test determinista debe ejecutarse sin watch, credenciales ni servicios externos;
- los bloqueos ambientales se reportan, no se silencian.

### \`14-checklists.md\`

Actualizar los quality gates y checklist de PR para exigir:

- \`make web-lint\`;
- \`make web-test\`;
- \`make web-build\`;
- \`make web-validate\`;
- \`make web-smoke\` solo cuando corresponda;
- evidencia de cualquier bloqueo;
- no presentar npm directo como sustituto del wrapper canónico.

## Reglas de ejecución para Codex

Antes de editar:

\`\`\`bash
pwd
git branch --show-current
git status --short --branch
git log -1 --oneline
find .. -name AGENTS.md -print
\`\`\`

Después de editar:

\`\`\`bash
git diff --check
make web-lint
make web-test
make web-build
make web-validate
\`\`\`

Ejecutar \`make web-smoke\` solamente si sus precondiciones están disponibles y documentadas.

No ejecutar:

- \`git reset --hard\`;
- \`git clean\`;
- \`git checkout --\`;
- \`git stash\` sobre cambios ajenos;
- instalaciones automáticas que modifiquen lockfiles;
- commits de archivos fuera del alcance.

No crear commit, push ni Pull Request sin una instrucción posterior explícita.

## Criterios de aceptación

El trabajo está terminado cuando:

- existe un \`Makefile\` raíz con los objetivos definidos;
- \`make web-lint\` ejecuta el lint real;
- \`make web-test\` ejecuta pruebas Jest no interactivas;
- \`make web-build\` ejecuta el build real;
- \`make web-validate\` compone los quality gates deterministas;
- \`make web-smoke\` queda separado y documentado;
- la documentación ya no prescribe únicamente npm directo;
- las pruebas de interacción relevantes de WEBUI-001 están presentes o la brecha está explícitamente documentada;
- \`git diff --check\` pasa;
- los cambios ajenos permanecen intactos;
- el agente reporta cada comando, resultado y bloqueo por separado.

## Resultado esperado del agente

El agente debe responder con:

- rama actual;
- archivos modificados;
- objetivos Make ejecutados;
- comandos npm subyacentes ejecutados;
- resultado de cada validación;
- tests nuevos o existentes relevantes;
- bloqueos ambientales;
- cambios ajenos preservados;
- confirmación explícita de que no hizo commit, push ni PR.

---

[← Guía frontend](README.md) · [↑ Volver al inicio](#top)
