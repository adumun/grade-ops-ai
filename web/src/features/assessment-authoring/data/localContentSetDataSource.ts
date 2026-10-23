import { createLocalId } from "../domain/localIdentity";
import type { ContentSet } from "../domain/types";
import type { ContentSetDataSource } from "./contentSetDataSource";
import { CONTENT_SET_ASSOCIATION_STORAGE_KEY, CONTENT_SET_ID, CONTENT_SET_STORAGE_KEY, CONTENT_SET_UPDATED_AT, DEMO_CONTENT_SETS, DEMO_MATERIALS } from "./fixtureContentSetDataSource";

function canUseStorage() { return typeof window !== "undefined" && Boolean(window.localStorage); }

function emptyContentSet(): ContentSet {
  return { id: CONTENT_SET_ID, name: "", description: "", materials: [], status: "draft", updatedAt: CONTENT_SET_UPDATED_AT };
}

type ContentLibrary = { schemaVersion: 1; currentId: string; contentSets: ContentSet[] };
function isContentSet(value: unknown): value is ContentSet {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<ContentSet>;
  return typeof item.id === "string" && typeof item.name === "string" && typeof item.description === "string" && item.status === "draft" && Array.isArray(item.materials);
}
function readLibrary(): ContentLibrary {
  const empty: ContentLibrary = { schemaVersion: 1, currentId: "", contentSets: [] };
  if (!canUseStorage()) return empty;
  const raw = window.localStorage.getItem(CONTENT_SET_STORAGE_KEY);
  if (!raw) return empty;
  try {
    const parsed: unknown = JSON.parse(raw);
    // Existing single-draft data remains readable; migrate only on a successful save.
    if (isContentSet(parsed)) return { schemaVersion: 1, currentId: parsed.id, contentSets: [parsed] };
    const library = parsed as Partial<ContentLibrary> | null;
    if (library?.schemaVersion !== 1 || !Array.isArray(library.contentSets)) return empty;
    return { schemaVersion: 1, currentId: typeof library.currentId === "string" ? library.currentId : "", contentSets: library.contentSets.filter(isContentSet) };
  } catch { return empty; }
}

export const localContentSetDataSource: ContentSetDataSource = {
  async getContentSet() {
    const library = readLibrary();
    return library.contentSets.find(item => item.id === library.currentId) ?? emptyContentSet();
  },
  async listMaterialFixtures() { return DEMO_MATERIALS.map((material) => ({ ...material })); },
  async getAssociatedContentSetIds() {
    if (!canUseStorage()) return [];
    const raw = window.localStorage.getItem(CONTENT_SET_ASSOCIATION_STORAGE_KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return Array.from(new Set(parsed.filter((id): id is string => typeof id === "string")));
      return typeof parsed === "string" ? [parsed] : [];
    } catch {
      return raw ? [raw] : [];
    }
  },
  async saveAssociation(contentSetIds) {
    if (canUseStorage()) window.localStorage.setItem(CONTENT_SET_ASSOCIATION_STORAGE_KEY, JSON.stringify(contentSetIds));
  },
  async listReusableContentSets() {
    const saved = readLibrary().contentSets;
    const savedIds = new Set(saved.map(item => item.id));
    const demoSets = DEMO_CONTENT_SETS.filter(item => !savedIds.has(item.id)).map(contentSet => ({ ...contentSet, materials: contentSet.materials.map(material => ({ ...material })) }));
    return [...saved, ...demoSets];
  },
  async saveContentSet(values, materials, existingId) {
    const id = existingId ?? createLocalId("content-set-local");
    const contentSet: ContentSet = { id, name: values.name.trim(), description: values.description.trim(), materials: materials.map(material => ({ ...material })), status: "draft", updatedAt: new Date().toISOString() };
    const library = readLibrary();
    const next: ContentLibrary = { schemaVersion: 1, currentId: id, contentSets: [...library.contentSets.filter(item => item.id !== id), contentSet] };
    if (canUseStorage()) window.localStorage.setItem(CONTENT_SET_STORAGE_KEY, JSON.stringify(next));
    return contentSet;
  },
  async reset() { if (canUseStorage()) { window.localStorage.removeItem(CONTENT_SET_STORAGE_KEY); window.localStorage.removeItem(CONTENT_SET_ASSOCIATION_STORAGE_KEY); } },
};
