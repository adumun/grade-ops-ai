import type { ContentSetValues, Material } from "./types";

export function validateContentSet(values: ContentSetValues): { errors: Partial<Record<keyof ContentSetValues, string>>; isReady: boolean } {
  const errors: Partial<Record<keyof ContentSetValues, string>> = {};
  if (!values.name.trim()) errors.name = "Ingresa un nombre para el conjunto.";
  return { errors, isReady: Object.keys(errors).length === 0 };
}

export function moveMaterial(materials: Material[], index: number, direction: -1 | 1): Material[] {
  const nextIndex = index + direction;
  if (index < 0 || index >= materials.length || nextIndex < 0 || nextIndex >= materials.length) return materials;
  const next = [...materials];
  [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
  return next;
}
