import type { Material } from "../domain/types";

export const CONTENT_SET_ID = "content-set-local-001";
export const CONTENT_SET_STORAGE_KEY = "gradeops.local-preview.content-set";
export const CONTENT_SET_UPDATED_AT = "2026-10-12T00:00:00.000Z";

export const DEMO_MATERIALS: Material[] = [
  { id: "material-pdf-functions", name: "Funciones y modularidad.pdf", type: "pdf", status: "ready", sourceLabel: "Biblioteca demo", description: "Resumen local de conceptos y ejemplos." },
  { id: "material-pptx-workshop", name: "Taller de composición.pptx", type: "pptx", status: "processing", sourceLabel: "Material compartido", description: "La extracción está simulada y aún no termina." },
  { id: "material-link-reference", name: "Referencia MDN · funciones", type: "link", status: "error", sourceLabel: "Enlace demo", description: "No se pudo revisar el contenido del enlace simulado." },
  { id: "material-image-diagram", name: "Diagrama de flujo.png", type: "image", status: "unsupported", sourceLabel: "Biblioteca demo", description: "Este formato requiere extracción futura." },
  { id: "material-text-note", name: "Nota del docente", type: "text", status: "ready", sourceLabel: "Texto local", description: "Una nota breve reutilizable para contextualizar la actividad." },
];
