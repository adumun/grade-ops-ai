import type { Material } from "../domain/types";
import MaterialRow from "./MaterialRow";
import styles from "./ContentSet.module.css";

export default function MaterialList({ materials, disabled, onRemove, onMove }: { materials: Material[]; disabled: boolean; onRemove: (id: string) => void; onMove: (index: number, direction: -1 | 1) => void }) {
  if (materials.length === 0) return <div className={styles.materialEmpty} role="status"><span aria-hidden="true">＋</span><h3>Aún no agregas materiales</h3><p>Elige un recurso demo para empezar a formar un conjunto reutilizable.</p></div>;
  return <ol className={styles.materialList} aria-label="Materiales del conjunto">{materials.map((material, index) => <MaterialRow key={material.id} material={material} index={index} total={materials.length} disabled={disabled} onRemove={() => onRemove(material.id)} onMove={(direction) => onMove(index, direction)} />)}</ol>;
}
