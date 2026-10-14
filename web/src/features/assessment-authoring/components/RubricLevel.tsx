import Button from "@/components/ds/Button";
import Field from "@/components/ds/Field";
import Input from "@/components/ds/Input";
import Textarea from "@/components/ds/Textarea";
import type { RubricLevel as RubricLevelType } from "../domain/types";
import styles from "./Rubric.module.css";

export default function RubricLevel({ level, disabled, onChange, onRemove }: { level: RubricLevelType; disabled: boolean; onChange: (field: "label" | "descriptor" | "score", value: string | number) => void; onRemove: () => void }) {
  return <li className={styles.level}>
    <div className={styles.levelGrid}>
      <Field htmlFor={`level-label-${level.id}`} label="Nivel de logro"><Input id={`level-label-${level.id}`} value={level.label} disabled={disabled} onChange={(event) => onChange("label", event.target.value)} /></Field>
      <Field htmlFor={`level-score-${level.id}`} label="Puntaje"><Input id={`level-score-${level.id}`} type="number" min="0" value={level.score} disabled={disabled} onChange={(event) => onChange("score", Number(event.target.value))} /></Field>
      <div className={styles.levelDescriptor}><Field htmlFor={`level-descriptor-${level.id}`} label="Descriptor" required><Textarea id={`level-descriptor-${level.id}`} value={level.descriptor} disabled={disabled} onChange={(event) => onChange("descriptor", event.target.value)} /></Field></div>
    </div>
    <Button size="sm" variant="ghost" disabled={disabled} onClick={onRemove}>Eliminar nivel</Button>
  </li>;
}
