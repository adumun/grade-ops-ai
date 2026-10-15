import type { ContentSet, Material, ContentSetValues } from "../domain/types";

export interface ContentSetDataSource {
  getContentSet(): Promise<ContentSet>;
  listMaterialFixtures(): Promise<Material[]>;
  listReusableContentSets(): Promise<ContentSet[]>;
  getAssociatedContentSetIds(): Promise<string[]>;
  saveAssociation(contentSetIds: string[]): Promise<void>;
  saveContentSet(values: ContentSetValues, materials: Material[], existingId?: string): Promise<ContentSet>;
  reset(): Promise<void>;
}
