<a id="top"></a>

# Scripts de Web

Estos scripts gestionan servidores locales y suites de navegador; no forman
parte de `make validate`.

| Archivo | Propósito |
|---|---|
| `preview-smoke.sh` | Arranca y detiene el servidor `local-preview`, espera `/preview` y ejecuta el smoke Playwright. |
| `e2e-test.sh` | Arranca la integración API/Postgres/Firebase Emulator, ejecuta el suite E2E y limpia sus procesos. |

Los scripts no generan credenciales productivas. El launcher preview vacía las
variables Firebase públicas para demostrar que `/preview` no depende de ellas.

---

[← README de Web](../README.md) · [↑ Volver al inicio](#top)
