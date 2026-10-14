import Button from "@/components/ds/Button";
import Select from "@/components/ds/Select";
import type { RubricVersion } from "../domain/types";
import styles from "./Rubric.module.css";

export default function RubricBaseSelector({ rubric, availableRubrics, disabled, onCreate, onSelect, onDuplicate }: { rubric: RubricVersion; availableRubrics: RubricVersion[]; disabled: boolean; onCreate: () => void; onSelect: (id: string) => void; onDuplicate: () => void }) {
  return <section className={styles.baseSelector} aria-labelledby="rubric-base-title"><div><span className={styles.kicker}>Reutilización demo/local</span><h2 id="rubric-base-title">Parte desde una base</h2><p>Versión actual: <strong>{rubric.title} · v{rubric.version}</strong>. Seleccionar o duplicar conserva la versión anterior; no hay conexión con backend.</p></div><div className={styles.baseActions}><Button variant="secondary" disabled={disabled} onClick={onCreate}>Crear rúbrica nueva</Button><label>Rúbrica demo<Select aria-label="Rúbrica demo" disabled={disabled} defaultValue="" onChange={(event) => { if (event.target.value) onSelect(event.target.value); }}><option value="">Seleccionar rúbrica demo</option>{availableRubrics.map((item) => <option key={item.id} value={item.id}>{item.title} · v{item.version}</option>)}</Select></label><Button variant="outline" disabled={disabled} onClick={onDuplicate}>Duplicar versión</Button></div></section>;
}
