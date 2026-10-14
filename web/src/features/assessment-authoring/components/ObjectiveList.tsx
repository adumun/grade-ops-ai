import type { Material, Objective } from "../domain/types";
import ObjectiveRow from "./ObjectiveRow";
import styles from "./Objectives.module.css";

export default function ObjectiveList({ objectives, materials, disabled, onEdit, onRemove, onDecision }: { objectives: Objective[]; materials: Material[]; disabled: boolean; onEdit: (objective: Objective) => void; onRemove: (id: string) => void; onDecision: (id: string, decision: "accepted" | "rejected") => void }) {
  if (objectives.length === 0) return <div className={styles.emptyObjectives} role="status"><h3>Aún no hay objetivos</h3><p>Agrega un objetivo manual o revisa la propuesta demo cuando esté disponible.</p></div>;
  return <ol className={styles.objectiveList} aria-label="Objetivos de la evaluación">{objectives.map((objective) => <ObjectiveRow key={objective.id} objective={objective} materials={materials} disabled={disabled} onEdit={() => onEdit(objective)} onRemove={() => onRemove(objective.id)} onDecision={(decision) => onDecision(objective.id, decision)} />)}</ol>;
}
