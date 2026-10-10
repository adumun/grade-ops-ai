<a id="top"></a>

# WEBUI-001 — Adopción del estándar ADÜMÜN de validación y Make

## Propósito

Este documento es un paquete de implementación para Codex CLI. Define cómo debe adaptar GradeOps AI Web al estándar transversal de desarrollo ADÜMÜN, sin modificar la maqueta visual de WEBUI-001.

La implementación debe realizarse en:

\`feat/teacher-operations-console-preview\`

La rama debe basarse en el \`develop\` actualizado.

## Corrección de autoridad

El estándar no se inventa dentro de GradeOps AI.

La autoridad normativa consultada es:

- [adumun/platform-standards](https://github.com/adumun/platform-standards)
- [STD-ENG-DEV-001 — Local Development & Environment Baseline](https://github.com/adumun/platform-standards/blob/main/engineering/STD-ENG-DEV-001-LOCAL-DEVELOPMENT-AND-ENVIRONMENT-BASELINE.md)
- [STD-ENG-QUAL-001 — Testing & Quality Gates Baseline](https://github.com/adumun/platform-standards/blob/main/engineering/STD-ENG-QUAL-001-TESTING-AND-QUALITY-GATES-BASELINE.md)
- [STD-ENG-WFM-001 — Work Planning and Traceability](https://github.com/adumun/platform-standards/blob/main/engineering/STD-ENG-WFM-001-WORK-PLANNING-AND-TRACEABILITY-STANDARD.md)

La implementación reusable de referencia es:

- [adumun/react-components](https://github.com/adumun/react-components)
- [Makefile de react-components](https://github.com/adumun/react-components/blob/master/Makefile)
- [README de react-components](https://github.com/adumun/react-components/blob/master/README.md)

La fuente de producto y alcance WebUI es:

- [GradeOps AI — Backlog de diseño WebUI en Google Drive](https://docs.google.com/document/d/1yzbAQvDq00A7cuZPnyCLyxPk8mkz9gymcRxz9v610hM/edit?usp=drivesdk)

Los documentos de Drive de normalización consultados confirman que:

- \`adumun/platform-standards\` es la autoridad normativa actual;
- los estándares y sus implementaciones deben mantenerse separados;
- la conformance se demuestra contra una versión concreta del estándar;
- Gitflow y worktrees forman parte del baseline de desarrollo;
- la adopción de un estándar y su estado normativo son dimensiones distintas.

## Estado actual de GradeOps AI

En \`develop\` de GradeOps AI se verificó:

- no existe \`Makefile\` en la raíz;
- no existe \`web/Makefile\`;
- \`AGENTS.md\` prescribe directamente comandos npm;
- \`web/README.md\` prescribe directamente comandos npm;
- la guía frontend prescribe Jest, Testing Library, lint y build;
- existen scripts E2E, pero no están expuestos por una fachada Make;
- la implementación actual no demuestra todavía conformance al baseline ADÜMÜN.

Esto es una brecha de adopción. No debe presentarse como si el estándar ya estuviera implementado.

## Qué debe adoptar GradeOps AI

### 1. Fachada Make estable

El repositorio debe exponer una fachada Make estable para operaciones recurrentes. El Makefile es una interfaz de desarrollo; no es el lugar para duplicar lógica compleja.

Los objetivos canónicos del estándar ADÜMÜN son:

\`\`\`text
make bootstrap
make deps
make up
make down
make test
make doctor
\`\`\`

Cuando aplica, también deben existir:

\`\`\`text
make validate
make lint
make build
make clean
make help
\`\`\`

La implementación de referencia en \`react-components\` usa exactamente esta familia de objetivos:

- \`bootstrap\`
- \`deps\`
- \`up\`
- \`down\`
- \`test\`
- \`typecheck\`
- \`doctor\`
- \`validate\`
- \`build\`
- \`clean\`
- \`help\`

No reemplazar esta convención por objetivos \`web-lint\`, \`web-test\` o \`web-validate\` como si fueran parte del estándar. En un monorepo pueden existir objetivos namespaced adicionales, pero deben ser una adaptación explícita y no sustituir silenciosamente los objetivos canónicos.

### 2. Perfil frontend dentro del monorepo

GradeOps AI contiene web, api, agents e infraestructura. Antes de decidir el significado global de \`make test\` o \`make validate\`, inspeccionar los comandos y Makefiles de cada componente.

Para este slice frontend se permite una implementación incremental:

- el Makefile raíz puede delegar a los comandos del perfil Web;
- los objetivos raíz deben documentar claramente su alcance actual;
- si \`make test\` ejecuta temporalmente solo Web, debe declararlo como una limitación de adopción;
- no afirmar que el repositorio completo está validado si solo se validó Web;
- los objetivos namespaced como \`make web-test\` pueden existir como conveniencia, pero no sustituyen la interfaz canónica.

Si la arquitectura del monorepo requiere Makefiles por componente, crear \`web/Makefile\` con la misma interfaz canónica y hacer que el Makefile raíz la orqueste de manera explícita.

## Requisitos mínimos del Makefile

### \`make bootstrap\`

Debe preparar el checkout local usando mecanismos reproducibles.

Debe:

- verificar el runtime esperado;
- preparar dependencias según la política del repositorio;
- respetar lockfiles;
- no sobrescribir configuración local poblada sin intención explícita;
- no introducir secretos;
- documentar qué hace.

No ejecutar instalaciones destructivas ni modificar archivos ajenos.

### \`make deps\`

Debe verificar el toolchain y dependencias requeridas.

Como mínimo debe distinguir:

- Node ausente;
- npm ausente;
- Make ausente;
- versión incompatible;
- dependencia no instalada;
- lockfile ausente o incoherente cuando sea detectable.

Puede seguir el patrón de \`react-components/Makefile\`, adaptándolo al monorepo.

### \`make up\` y \`make down\`

Deben documentar la semántica del entorno local.

- Si el frontend no necesita levantar servicios para \`/preview\`, declararlo.
- Si el monorepo requiere Docker Compose para API, base de datos o agentes, delegar explícitamente a Compose.
- No iniciar servicios remotos silenciosamente.
- No usar \`develop\` como fallback implícito.
- \`down\` no debe borrar volúmenes ni datos salvo que exista un objetivo destructivo separado y documentado.

Para el perfil Web existen además objetivos especializados, sin sustituir la
interfaz canónica: \`make preview\` y \`make preview-smoke\` validan \`/preview\`
con datos mock y sin API/Firebase; \`make smoke\` delega al flujo de integración
local completo con PostgreSQL, API y Firebase Auth Emulator. El perfil
\`develop\` se reserva para rutas protegidas y requiere configuración pública
Firebase real.

### \`make test\`

Debe ejecutar la suite tecnológica determinista del alcance declarado.

Para Web:

\`\`\`bash
cd web
npm run test -- --runInBand
\`\`\`

El wrapper debe:

- ser no interactivo;
- no usar watch mode;
- devolver código distinto de cero ante fallos;
- conservar los mocks existentes;
- no depender de Firebase real;
- no depender de APIs remotas;
- no depender de un servidor dev activo.

Los tests deben cubrir comportamiento observable con Jest + Testing Library. Para WEBUI-001 verificar, como mínimo, si ya están cubiertos:

- render de la cola;
- límite de cinco pendientes;
- prioridades;
- filtros y limpieza;
- estados de carga, vacío y error;
- drawer móvil;
- cierre por botón;
- cierre por overlay;
- cierre por Escape;
- \`aria-expanded\`;
- \`aria-controls\`.

Agregar tests solo cuando falte cobertura lógica real. No usar Jest para afirmar propiedades CSS que requieren un navegador.

### \`make lint\`

Debe delegar al lint oficial del componente:

\`\`\`bash
cd web
npm run lint
\`\`\`

### \`make build\`

Debe delegar al build real:

\`\`\`bash
cd web
npm run build
\`\`\`

Si falla por configuración preexistente, por ejemplo Firebase, el fallo debe conservarse y reportarse con su causa. No convertirlo artificialmente en éxito.

El wrapper valida primero las variables públicas Firebase requeridas para
\`develop\` y distingue variables ausentes o placeholders de un fallo real de
compilación. \`/preview\` no inicializa Firebase durante build ni necesita esas
variables.

### \`make doctor\`

Debe ser rápido y side-effect-safe.

Debe verificar, según el alcance disponible:

- archivos de control del repositorio;
- toolchain;
- lockfiles;
- package manifests;
- \`git diff --check\`;
- configuración local relevante;
- ausencia de secretos versionados;
- coherencia básica de la estructura;
- estado de worktree y rama cuando sea seguro leerlo.

No debe requerir una mutación destructiva.

### \`make validate\`

Debe componer quality gates deterministas del alcance documentado.

Para el perfil Web, como mínimo:

\`\`\`text
make deps
make lint
make test
make build
\`\`\`

Puede delegar a objetivos del componente, pero debe reportar claramente si valida:

- solo Web;
- todo el monorepo;
- o una combinación parcial.

No incluir smoke E2E externo por defecto.

### \`make help\`

Debe documentar todos los objetivos públicos, sus precondiciones y su alcance.

## Smoke E2E y validación visual

El smoke visual del preview y los E2E de navegador son evidencia complementaria, no sustituto de los tests deterministas.

Mantener separado:

- \`make test\`: suite determinista;
- \`make validate\`: quality gates reproducibles;
- smoke visual/Playwright: validación de navegador;
- \`scripts/smoke-e2e-local.sh\`: flujo que requiere Docker, API, agentes, Firebase, variables y datos reales.

No incluir el script de backend E2E dentro de \`make validate\` si requiere servicios o credenciales no reproducibles.

El smoke de \`/preview\` usa \`web/playwright.preview.config.ts\`, inicia su propio
servidor Next temporal y no deja procesos huérfanos. El smoke de integración
existente se mantiene separado en \`make smoke\` y conserva sus precondiciones.

La validación visual de WEBUI-001 debe conservar:

- desktop;
- tablet;
- teléfono;
- scroll del shell;
- drawer móvil;
- ausencia de overflow horizontal;
- responsive de la cola 3fr / 1fr.

## Documentación que debe actualizar Codex

Actualizar de forma consistente:

- \`AGENTS.md\`;
- \`web/README.md\`;
- \`web/docs/gradeops-ai-frontend-guidelines/10-testing-calidad-y-automatizacion.md\`;
- \`web/docs/gradeops-ai-frontend-guidelines/14-checklists.md\`;
- README de cada carpeta tocada, conforme a \`RULES.md\`.

La documentación debe distinguir:

- estándar ADÜMÜN;
- implementación Make de GradeOps;
- comandos npm subyacentes;
- adopción parcial;
- bloqueos ambientales;
- evidencia de conformance.

No declarar “estándar activo” si la fuente normativa consultada mantiene estado \`PROPOSED\`. Declarar la versión y el estado observado.

## Workflow Git y worktrees

Aplicar el baseline ADÜMÜN:

- Issue antes de implementación material;
- branch auxiliar desde \`develop\`;
- worktree aislado por unidad independiente;
- PR hacia \`develop\`;
- commits con referencia al Issue;
- no modificar \`develop\` directamente;
- no borrar cambios ajenos;
- no usar reset destructivo;
- no reutilizar una rama mergeada como contenedor permanente de trabajo nuevo sin explicitarlo.

El cambio de Make/documentación debe ser una unidad trazable separada del follow-up visual si el Issue o el PR lo requieren.

## Validación obligatoria de Codex

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
make help
make deps
make lint
make test
make build
make doctor
make validate
\`\`\`

Ejecutar \`make up\`, \`make down\` y smoke E2E solo con sus precondiciones documentadas.

Si un objetivo no existe, falla o solo cubre una parte del monorepo:

- no inventar un resultado exitoso;
- informar el objetivo exacto;
- informar el comando subyacente;
- informar el bloqueo;
- clasificarlo como brecha de adopción.

## Restricciones

No:

- modificar \`data.ts\`;
- rediseñar la maqueta;
- cambiar textos, prioridades, filtros o drawer;
- agregar dependencias sin autorización;
- modificar \`.github/copilot-instructions.md\`;
- incluir cambios locales ajenos;
- crear comandos ocultos o aliases no documentados;
- hacer commit, push o PR sin instrucción explícita posterior.

## Criterios de aceptación

- Existe una fachada Make documentada.
- Los objetivos canónicos ADÜMÜN están presentes o su ausencia queda explícitamente reportada.
- \`make test\` ejecuta pruebas deterministas del alcance declarado.
- \`make doctor\` existe y no es destructivo.
- \`make validate\` compone los quality gates disponibles.
- \`make build\` no oculta bloqueos ambientales.
- Smoke E2E queda separado.
- La documentación distingue WHAT normativo de HOW implementado.
- Se reporta el estado de adopción sin exagerarlo.
- Se respetan Gitflow, Issues, worktrees y PR hacia \`develop\`.
- \`git diff --check\` pasa.
- Los cambios ajenos permanecen intactos.

## Resultado que Codex debe reportar

- rama y worktree;
- Issue asociado;
- archivos modificados;
- objetivos Make ejecutados;
- comandos tecnológicos subyacentes;
- alcance real de cada validación;
- tests nuevos o existentes;
- bloqueos ambientales;
- conformance observada y brechas;
- cambios ajenos preservados;
- confirmación de commit/push/PR, solo si fueron explícitamente autorizados.

---

[← Guía frontend](README.md) · [↑ Volver al inicio](#top)
