SHELL := /bin/sh

WEB_DIR := web
COMPOSE_FILE := compose.yml
MIN_NODE_MAJOR := 18
MIN_NPM_MAJOR := 9

.DEFAULT_GOAL := help

.PHONY: bootstrap deps up down preview preview-smoke smoke test lint build typecheck doctor validate clean help _check-toolchain _check-build-config

WEB_PROFILE ?= develop

##@ Desarrollo local

bootstrap: _check-toolchain ## Instala dependencias Web desde el lockfile reproducible
	@echo "Instalando dependencias de Web desde web/package-lock.json..."
	cd $(WEB_DIR) && npm ci --ignore-scripts --no-audit --no-fund

deps: _check-toolchain ## Verifica toolchain, manifests, lockfile y dependencias instaladas
	@test -f $(WEB_DIR)/package.json || (echo "ERROR: falta $(WEB_DIR)/package.json" >&2; exit 1)
	@test -f $(WEB_DIR)/package-lock.json || (echo "ERROR: falta $(WEB_DIR)/package-lock.json; no se puede verificar el lockfile" >&2; exit 1)
	@test -d $(WEB_DIR)/node_modules || (echo "ERROR: faltan dependencias instaladas; ejecuta make bootstrap" >&2; exit 1)
	cd $(WEB_DIR) && npm ls --depth=0 --ignore-scripts

up: ## Levanta el entorno Compose local; puede requerir .env, Firebase y claves
	@echo "Entorno local completo: Compose puede requerir .env, Firebase y claves de agentes."
	docker compose -f $(COMPOSE_FILE) up -d

down: ## Detiene Compose sin borrar volúmenes ni datos
	docker compose -f $(COMPOSE_FILE) down

preview: ## Inicia /preview en perfil local-preview sin API ni Firebase
	cd $(WEB_DIR) && env NEXT_PUBLIC_GRADEOPS_PROFILE=local-preview NEXT_PUBLIC_FIREBASE_API_KEY= NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN= NEXT_PUBLIC_FIREBASE_PROJECT_ID= NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET= NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID= NEXT_PUBLIC_FIREBASE_APP_ID= NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID= NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST= npm run dev

preview-smoke: ## Ejecuta Playwright determinista de /preview con servidor gestionado
	./web/scripts/preview-smoke.sh

smoke: ## Ejecuta integración local completa con API, Postgres y Firebase Emulator
	./web/scripts/e2e-test.sh

##@ Quality gates deterministas (alcance actual: Web)

test: ## Ejecuta Jest determinista de Web sin watch mode
	cd $(WEB_DIR) && npm run test -- --runInBand

lint: ## Ejecuta el lint oficial de Web
	cd $(WEB_DIR) && npm run lint

build: _check-build-config ## Ejecuta el build real de Web con Firebase productivo configurado
	cd $(WEB_DIR) && npm run build

typecheck: ## Ejecuta el typecheck de TypeScript de Web
	cd $(WEB_DIR) && npx tsc --noEmit

validate: deps lint test build ## Compone deps, lint, test y build para Web; no incluye smoke E2E
	@echo "Validación determinista completada para Web; no incluye smoke E2E ni servicios remotos."

doctor: _check-toolchain ## Ejecuta comprobaciones rápidas, perfil activo y variables requeridas
	@test -f AGENTS.md || (echo "ERROR: falta AGENTS.md" >&2; exit 1)
	@test -f RULES.md || (echo "ERROR: falta RULES.md" >&2; exit 1)
	@test -f $(WEB_DIR)/package.json || (echo "ERROR: falta $(WEB_DIR)/package.json" >&2; exit 1)
	@test -f $(WEB_DIR)/package-lock.json || (echo "ERROR: falta $(WEB_DIR)/package-lock.json" >&2; exit 1)
	@test ! -e $(WEB_DIR)/.env.local || echo "Aviso: existe configuración local .env.local; no se modifica."
	@tracked_sensitive=$$(git ls-files | grep -E '(^|/)(\.env$$|.*(secret|credentials).*(json|yml|yaml|pem|key)$$)' || true); test -z "$$tracked_sensitive" || (echo "ERROR: posible secreto versionado detectado:" >&2; echo "$$tracked_sensitive" >&2; exit 1)
	@echo "Perfil web activo: $(WEB_PROFILE)"
	@node scripts/check-web-env.mjs --profile $(WEB_PROFILE)
	git diff --check
	git branch --show-current
	git status --short --branch

clean: ## Limpia artefactos generados Web; no elimina volúmenes ni datos
	@echo "clean no elimina datos ni volúmenes; solo limpia artefactos Web generados."
	rm -rf $(WEB_DIR)/.next $(WEB_DIR)/coverage

##@ Ayuda

help: ## Muestra objetivos públicos, precondiciones y alcance
	@awk 'BEGIN {FS = ":.*##"; printf "Uso: make <objetivo>\n\nObjetivos públicos (alcance actual: Web):\n"} /^[a-zA-Z0-9_.-]+:.*##/ {printf "  %-12s %s\n", $$1, $$2} /^##@/ {printf "\n%s\n", substr($$0, 5)}' $(MAKEFILE_LIST)

_check-toolchain:
	@command -v make >/dev/null 2>&1 || (echo "ERROR: Make no está instalado" >&2; exit 1)
	@command -v node >/dev/null 2>&1 || (echo "ERROR: Node.js no está instalado" >&2; exit 1)
	@command -v npm >/dev/null 2>&1 || (echo "ERROR: npm no está instalado" >&2; exit 1)
	@node -e 'const v=process.versions.node.split(".").map(Number); if (v[0] < $(MIN_NODE_MAJOR)) { console.error("ERROR: Node.js requiere >= $(MIN_NODE_MAJOR), encontrado " + process.version); process.exit(1); }'
	@npm_major=$$(npm --version | cut -d. -f1); test "$$npm_major" -ge $(MIN_NPM_MAJOR) || (echo "ERROR: npm requiere >= $(MIN_NPM_MAJOR), encontrado $$(npm --version)" >&2; exit 1)
	@echo "Toolchain OK: Node $$(node --version), npm $$(npm --version), Make $$(make --version | head -1)"

_check-build-config: _check-toolchain
	@node scripts/check-web-env.mjs --profile $(WEB_PROFILE)
