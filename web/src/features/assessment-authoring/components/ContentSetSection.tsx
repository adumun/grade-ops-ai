import Button from "@/components/ds/Button";
import Field from "@/components/ds/Field";
import Input from "@/components/ds/Input";
import Textarea from "@/components/ds/Textarea";
import LucideIcon from "@/components/ds/LucideIcon";
import type { ContentSetMode } from "../hooks/useContentSetDraft";
import type { ContentSetValues, ContentSetValidation } from "../domain/types";
import type { ContentSetSaveState } from "../hooks/useContentSetDraft";
import styles from "./ContentSet.module.css";

type Props = {
  values: ContentSetValues;
  validation: ContentSetValidation;
  validationRequested: boolean;
  mode: ContentSetMode;
  canEdit: boolean;
  saveState: ContentSetSaveState;
  onChange: (field: keyof ContentSetValues, value: string) => void;
  onSave: () => void;
  onRetry: () => void;
  onCancel: () => void;
  showActions?: boolean;
};

export default function ContentSetSection({ values, validation, validationRequested, mode, canEdit, saveState, onChange, onSave, onRetry, onCancel, showActions = true }: Props) {
  const disabled = !canEdit || saveState === "saving" || mode === "existing";
  const title = mode === "existing" ? "Conjunto asociado" : "Crea un conjunto nuevo";
  const description = mode === "existing"
    ? "Este conjunto ya es reutilizable. Puedes asociarlo a esta evaluación sin duplicar sus materiales."
    : "Define un recurso reutilizable que después podrás asociar a una o más evaluaciones.";

  return (
    <section className={styles.contentSection} aria-labelledby="content-set-title">
      <div className={styles.sectionHeading}>
        <div>
          <span className={styles.kicker}>{mode === "existing" ? "Conjunto reutilizable seleccionado" : "Nuevo conjunto reutilizable"}</span>
          <h2 id="content-set-title">{title}</h2>
          <p>{description}</p>
        </div>
      </div>
      <div className={styles.formGrid}>
        <Field htmlFor="content-set-name" label="Nombre del conjunto" required error={validationRequested ? validation.errors.name : undefined}>
          <Input id="content-set-name" value={values.name} disabled={disabled} placeholder="Ej. Fundamentos de programación" onChange={(event) => onChange("name", event.target.value)} />
        </Field>
        <div className={styles.fullField}>
          <Field htmlFor="content-set-description" label="Descripción" hint="Opcional">
            <Textarea id="content-set-description" value={values.description} disabled={disabled} placeholder="Qué reúne este conjunto y para qué conviene reutilizarlo." onChange={(event) => onChange("description", event.target.value)} />
          </Field>
        </div>
      </div>
      {saveState === "error" && <div className={styles.errorBanner} role="alert"><strong>No se pudo guardar el conjunto local.</strong><span>Conservamos tus cambios para que puedas reintentar.</span><Button size="sm" variant="outline" onClick={onRetry} disabled={!canEdit}>Reintentar</Button></div>}
      {saveState === "saved" && <div className={styles.successBanner} role="status">Conjunto asociado localmente. Puedes retomarlo desde esta evaluación.</div>}
      {showActions && <div className={styles.formActions}><Button variant="outline" type="button" disabled={saveState === "saving"} onClick={onCancel} startIcon={<LucideIcon name="arrow-left" size={16} />}>Volver al propósito</Button><Button type="button" loading={saveState === "saving"} disabled={!canEdit} onClick={onSave} startIcon={<LucideIcon name="save" size={16} />}>{saveState === "saved" ? "Guardar cambios" : "Guardar conjunto"}</Button></div>}
    </section>
  );
}
