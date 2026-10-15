import type { ContentSet } from "../domain/types";
import type { ContentSetDataSource } from "./contentSetDataSource";
import { CONTENT_SET_ASSOCIATION_STORAGE_KEY, CONTENT_SET_ID, CONTENT_SET_STORAGE_KEY, CONTENT_SET_UPDATED_AT, DEMO_CONTENT_SETS, DEMO_MATERIALS } from "./fixtureContentSetDataSource";

function canUseStorage() { return typeof window !== "undefined" && Boolean(window.localStorage); }

function emptyContentSet(): ContentSet {
  return { id: CONTENT_SET_ID, name: "", description: "", materials: [], status: "draft", updatedAt: CONTENT_SET_UPDATED_AT };
}

export const localContentSetDataSource: ContentSetDataSource = {
  async getContentSet() {
    if (!canUseStorage()) return emptyContentSet();
    const raw = window.localStorage.getItem(CONTENT_SET_STORAGE_KEY);
    if (!raw) return emptyContentSet();
    try {
      const parsed = JSON.parse(raw) as ContentSet;
      return parsed?.status === "draft" && Array.isArray(parsed.materials) ? parsed : emptyContentSet();
    } catch { return emptyContentSet(); }
  },
  async listMaterialFixtures() { return DEMO_MATERIALS.map((material) => ({ ...material })); },
  async getAssociatedContentSetIds() {
    if (!canUseStorage()) return [];
    const raw = window.localStorage.getItem(CONTENT_SET_ASSOCIATION_STORAGE_KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.filter((id): id is string => typeof id === "string");
      return typeof parsed === "string" ? [parsed] : [];
    } catch {
      return raw ? [raw] : [];
    }
  },
  async saveAssociation(contentSetIds) {
    if (canUseStorage()) window.localStorage.setItem(CONTENT_SET_ASSOCIATION_STORAGE_KEY, JSON.stringify(contentSetIds));
  },
  async listReusableContentSets() {
    const demoSets = DEMO_CONTENT_SETS.map((contentSet) => ({ ...contentSet, materials: contentSet.materials.map((material) => ({ ...material })) }));
    if (!canUseStorage()) return demoSets;
    const raw = window.localStorage.getItem(CONTENT_SET_STORAGE_KEY);
    if (!raw) return demoSets;
    try {
      const saved = JSON.parse(raw) as ContentSet;
      if (!saved?.name?.trim() || !Array.isArray(saved.materials)) return demoSets;
      return [saved, ...demoSets.filter((contentSet) => contentSet.id !== saved.id)];
    } catch { return demoSets; }
  },
  async saveContentSet(values, materials, existingId) {
    const id = existingId ?? `content-set-local-${Date.now()}`;
    const contentSet: ContentSet = { id, name: values.name.trim(), description: values.description.trim(), materials, status: "draft", updatedAt: new Date().toISOString() };
    if (canUseStorage()) window.localStorage.setItem(CONTENT_SET_STORAGE_KEY, JSON.stringify(contentSet));
    return contentSet;
  },
  async reset() { if (canUseStorage()) { window.localStorage.removeItem(CONTENT_SET_STORAGE_KEY); window.localStorage.removeItem(CONTENT_SET_ASSOCIATION_STORAGE_KEY); } },
};
