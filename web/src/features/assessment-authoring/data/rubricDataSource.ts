import type { RubricVersion } from "../domain/types";

export interface RubricDataSource {
  getRubric(): Promise<{ rubric: RubricVersion; availableRubrics: RubricVersion[] }>;
  saveRubric(rubric: RubricVersion): Promise<RubricVersion>;
  reset(): Promise<void>;
}
