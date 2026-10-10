<a id="top"></a>

# Smoke E2E de Web

Esta carpeta contiene pruebas Playwright de navegador. El smoke de
`local-preview` usa únicamente la maqueta mock de `/preview`; los demás specs
requieren la integración local con API, Postgres y Firebase Auth Emulator.

| Archivo | Propósito |
|---|---|
| `preview.spec.ts` | HTTP, cola de cinco pendientes, responsive, scroll, overflow y drawer móvil de `/preview`. |
| `login.spec.ts` | Login de navegador contra API y Firebase Emulator. |
| `registration.spec.ts` | Registro real de navegador contra API y Firebase Emulator. |
| `draft-builder.spec.ts` | Flujo del Draft Builder contra API local con datos sembrados. |
| `fixtures/auth.ts` | Fixtures autenticados para integración. |
| `support/` | Helpers del Emulator, seed y navegación; ver su código para contratos concretos. |

Ejecutar `make preview-smoke` para el perfil preview o `make smoke` para el
flujo de integración completo. No se usan credenciales Firebase reales en el
perfil local-integration.

---

[← README de Web](../README.md) · [↑ Volver al inicio](#top)
