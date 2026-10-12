# Button

Contrato compartido para acciones de la interfaz docente. La implementación productiva vive en `web/src/components/ds/Button.tsx`; los tokens equivalentes se mantienen en `web/src/styles/ds-tokens/components.css` y `web/design-system/tokens/components.css`.

## Variantes

- `primary`: acción principal. Fondo `--button-primary-bg`, texto e iconos `--button-primary-fg`, hover `--button-primary-hover-bg` y active `--button-primary-active-bg`.
- `secondary`: superficie clara con borde y texto definidos. `outline` se conserva como alias compatible para código existente.
- `ghost`: acción de baja prominencia, sin borde ni superficie sólida; hover usa `--button-ghost-hover-bg`.
- `link`: acción textual con estados hover/focus, sin apariencia de botón sólido.

## Tokens

La tipografía usa los roles `--type-label-font` y `--type-label-weight`. Alturas, paddings e iconos usan `--button-height-*`, `--button-padding-*` y `--button-icon-*`. Radio, foco, sombras y motion se resuelven mediante `--radius-*`, `--ring`, `--shadow-*` y `--dur-*`; ninguna pantalla debe redefinir estos valores para un botón.

## Iconos

Los iconos son opcionales y se pasan como `startIcon` o `endIcon`:

```tsx
<Button startIcon={<LucideIcon name="save" size={16} />}>Guardar</Button>
```

Usar iconos solo cuando aporten reconocimiento de la acción: `plus` para crear, `clipboard-check` o `search` para revisar, `save` para guardar, `send`/`upload` para publicar y `arrow-left` para volver. No agregar iconos decorativos a cada botón ni repetir el texto con un icono redundante. Para un control solo icono, usar `IconButton` con `label`; si se usa `Button`, debe tener `aria-label`.

## Estados y accesibilidad

- `disabled` bloquea interacción, usa contraste de estado inactivo y no parece disponible.
- `loading` bloquea el botón, expone `aria-busy="true"` y muestra un spinner visible sin ocultar el texto de la acción.
- Todos los botones tienen foco visible mediante `--shadow-focus`/`--ring`.
- El texto visible sigue siendo la etiqueta principal; los iconos se marcan como decorativos para evitar nombres accesibles duplicados.

## Ejemplos

```tsx
<Button variant="primary" startIcon={<LucideIcon name="plus" size={16} />}>Nueva evaluación</Button>
<Button variant="secondary">Cancelar</Button>
<Button variant="ghost" size="sm">Limpiar</Button>
<Button variant="primary" loading>Guardar</Button>
<Button aria-label="Cerrar" startIcon={<LucideIcon name="minus" size={18} />} />
```

No usar `Button` para navegación si un enlace visible expresa mejor el destino; no usar iconos para reemplazar texto en acciones de negocio sin un nombre accesible equivalente.
