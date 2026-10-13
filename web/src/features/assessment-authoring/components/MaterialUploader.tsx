import { useState } from "react";
import Button from "@/components/ds/Button";
import LucideIcon from "@/components/ds/LucideIcon";
import type { Material } from "../domain/types";
import styles from "./ContentSet.module.css";

export default function MaterialUploader({ fixtures, disabled, onAdd }: { fixtures: Material[]; disabled: boolean; onAdd: (id: string) => void }) {
  const [selected, setSelected] = useState(fixtures[0]?.id ?? "");
  return <div className={styles.uploader} aria-labelledby="add-material-title"><div><span className={styles.kicker}>Biblioteca demo</span><h2 id="add-material-title">Agregar material</h2><p>Materiales reutilizables. Selecciona un material demo para agregarlo.</p></div><div className={styles.addMaterialControls}><label htmlFor="material-fixture">Material demo</label><select id="material-fixture" value={selected} disabled={disabled} onChange={(event) => setSelected(event.target.value)}>{fixtures.map((material) => <option key={material.id} value={material.id}>{material.name} · {material.type.toUpperCase()}</option>)}</select><Button type="button" disabled={disabled || !selected} onClick={() => onAdd(selected)} startIcon={<LucideIcon name="plus" size={16} />}>Agregar material</Button></div><div className={styles.demoDropzone}><LucideIcon name="upload" size={30} /><strong>Materiales reutilizables</strong><span>Selecciona un material demo para agregarlo al conjunto.</span></div></div>;
}
