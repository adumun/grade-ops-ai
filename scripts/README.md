<a id="top"></a>

# Scripts locales

Esta carpeta contiene automatizaciones locales que no forman parte de los
quality gates deterministas del código frontend.

| Archivo | Propósito |
|---|---|
| `check-web-env.mjs` | Verifica la configuración Firebase pública requerida por perfiles no-preview sin imprimir valores. |
| `lib/e2e-smoke-flow.sh` | Flujo compartido de integración contra API/Firebase. |
| `smoke-e2e-local.sh` | Smoke de integración local completo con servicios reales del stack local y emulator. |
| `smoke-e2e-render-beta.sh` | Smoke contra el entorno beta desplegado; requiere credenciales externas. |

El launcher `web/scripts/preview-smoke.sh` pertenece al README de `web/` y
administra únicamente el servidor temporal del perfil `local-preview`.

El perfil `local-preview` no usa estos scripts de integración. Su smoke vive
en `web/e2e/preview.spec.ts`; `web/scripts/preview-smoke.sh` administra el
servidor temporal y se ejecuta con `make preview-smoke`.

---

[← README del repositorio](../README.md) · [↑ Volver al inicio](#top)
