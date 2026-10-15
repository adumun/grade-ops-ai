import type { ContentSet, Material, ContentSetValues } from "../domain/types";

export interface ContentSetDataSource {
  getContentSet(): Promise<ContentSet>;
  listMaterialFixtures(): Promise<Material[]>;
  listReusableContentSets(): Promise<ContentSet[]>;
  getAssociatedContentSetId(): Promise<string | undefined>;
  saveAssociation(contentSetId: string): Promise<void>;
  saveContentSet(values: ContentSetValues, materials: Material[], existingId?: string): Promise<ContentSet>;
  reset(): Promise<void>;
}
