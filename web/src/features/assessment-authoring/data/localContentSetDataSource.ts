import type { ContentSet } from "../domain/types";
import type { ContentSetDataSource } from "./contentSetDataSource";
import { CONTENT_SET_ID, CONTENT_SET_STORAGE_KEY, CONTENT_SET_UPDATED_AT, DEMO_MATERIALS } from "./fixtureContentSetDataSource";

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
  async saveContentSet(values, materials, existingId = CONTENT_SET_ID) {
    const contentSet: ContentSet = { id: existingId, name: values.name.trim(), description: values.description.trim(), materials, status: "draft", updatedAt: CONTENT_SET_UPDATED_AT };
    if (canUseStorage()) window.localStorage.setItem(CONTENT_SET_STORAGE_KEY, JSON.stringify(contentSet));
    return contentSet;
  },
  async reset() { if (canUseStorage()) window.localStorage.removeItem(CONTENT_SET_STORAGE_KEY); },
};
