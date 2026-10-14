import Button from "@/components/ds/Button";
import Field from "@/components/ds/Field";
import Input from "@/components/ds/Input";
import LucideIcon from "@/components/ds/LucideIcon";
import Textarea from "@/components/ds/Textarea";
import type { Material, ObjectiveValidation, ObjectiveValues } from "../domain/types";
import type { ObjectiveSaveState } from "../hooks/useObjectiveSet";
import styles from "./Objectives.module.css";

type Props = {
  values: ObjectiveValues;
  materials: Material[];
  validation: ObjectiveValidation;
  editing: boolean;
  canEdit: boolean;
  saveState: ObjectiveSaveState;
  onChange: (field: keyof ObjectiveValues, value: string) => void;
  onToggleMaterial: (id: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
};

export default function ObjectiveBuilder({ values, materials, validation, editing, canEdit, saveState, onChange, onToggleMaterial, onSubmit, onCancel }: Props) {
  const disabled = !canEdit || saveState === "saving";
  return <section className={styles.builder} aria-labelledby="objective-builder-title">
    <div className={styles.sectionHeading}><div><span className={styles.kicker}>{editing ? "Edición local" : "Objetivo manual"}</span><h2 id="objective-builder-title">{editing ? "Edita el objetivo" : "Agrega un objetivo medible"}</h2><p>Describe lo que el estudiante debe poder demostrar, cómo se observará y qué materiales lo respaldan.</p></div></div>
    <div className={styles.formGrid}>
      <div className={styles.fullField}><Field htmlFor="objective-title" label="Objetivo medible" required error={validation.errors.title}><Input id="objective-title" value={values.title} disabled={disabled} placeholder="Ej. Aplicar funciones para resolver un problema" onChange={(event) => onChange("title", event.target.value)} /></Field></div>
      <Field htmlFor="objective-description" label="Descripción" hint="Opcional"><Textarea id="objective-description" value={values.description} disabled={disabled} placeholder="Alcance y condiciones del objetivo." onChange={(event) => onChange("description", event.target.value)} /></Field>
      <Field htmlFor="objective-evidence" label="Evidencia observable" hint="Qué debe poder demostrar el estudiante."><Textarea id="objective-evidence" value={values.observableEvidence} disabled={disabled} placeholder="Ej. Explica y aplica una estrategia verificable." onChange={(event) => onChange("observableEvidence", event.target.value)} /></Field>
    </div>
    <fieldset className={styles.materialPicker} disabled={disabled}><legend>Materiales que respaldan este objetivo</legend>{materials.length === 0 ? <p className={styles.materialHint}>Aún no hay materiales en el ContentSet. Puedes volver a contenidos para agregarlos.</p> : <div className={styles.materialChoices}>{materials.map((material) => <label key={material.id} className={styles.materialChoice}><input type="checkbox" checked={values.materialIds.includes(material.id)} onChange={() => onToggleMaterial(material.id)} /><span><strong>{material.name}</strong><small>{material.type.toUpperCase()} · {material.sourceLabel}</small></span></label>)}</div>}</fieldset>
    {validation.warnings.length > 0 && <div className={styles.warningBanner} role="status"><LucideIcon name="alert-triangle" size={16} />{validation.warnings.join(" ")}</div>}
    <div className={styles.formActions}>{editing && <Button variant="outline" type="button" disabled={disabled} onClick={onCancel}>Cancelar edición</Button>}<Button type="button" disabled={!validation.isReady || disabled} onClick={onSubmit} startIcon={<LucideIcon name={editing ? "save" : "plus"} size={16} />}>{editing ? "Guardar objetivo" : "Agregar objetivo"}</Button></div>
  </section>;
}
