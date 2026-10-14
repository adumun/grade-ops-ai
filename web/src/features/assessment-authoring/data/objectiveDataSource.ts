import type { ObjectiveSet } from "../domain/types";

export interface ObjectiveDataSource {
  getObjectiveSet(): Promise<ObjectiveSet>;
  saveObjectiveSet(objectives: ObjectiveSet["objectives"]): Promise<ObjectiveSet>;
  reset(): Promise<void>;
}
