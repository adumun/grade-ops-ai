import type { ContentSet, Material, ContentSetValues } from "../domain/types";

export interface ContentSetDataSource {
  getContentSet(): Promise<ContentSet>;
  listMaterialFixtures(): Promise<Material[]>;
  saveContentSet(values: ContentSetValues, materials: Material[], existingId?: string): Promise<ContentSet>;
  reset(): Promise<void>;
}
