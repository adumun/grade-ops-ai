import Button from "@/components/ds/Button";
import Field from "@/components/ds/Field";
import Input from "@/components/ds/Input";
import Textarea from "@/components/ds/Textarea";
import LucideIcon from "@/components/ds/LucideIcon";
import type { ContentSetValues, ContentSetValidation } from "../domain/types";
import type { ContentSetSaveState } from "../hooks/useContentSetDraft";
import styles from "./ContentSet.module.css";

type Props = { values: ContentSetValues; validation: ContentSetValidation; canEdit: boolean; saveState: ContentSetSaveState; onChange: (field: keyof ContentSetValues, value: string) => void; onSave: () => void; onRetry: () => void; onCancel: () => void };

export default function ContentSetSection({ values, validation, canEdit, saveState, onChange, onSave, onRetry, onCancel }: Props) {
  const disabled = !canEdit || saveState === "saving";
  return <section className={styles.contentSection} aria-labelledby="content-set-title"><div className={styles.sectionHeading}><div><span className={styles.kicker}>Conjunto reutilizable</span><h2 id="content-set-title">Nombra tus contenidos</h2><p>Este conjunto puede alimentar más de una evaluación. Todavía se guarda solo en este navegador.</p></div></div><div className={styles.formGrid}><Field htmlFor="content-set-name" label="Nombre del conjunto" required error={validation.errors.name}><Input id="content-set-name" value={values.name} disabled={disabled} placeholder="Ej. Fundamentos de programación" onChange={(event) => onChange("name", event.target.value)} /></Field><div className={styles.fullField}><Field htmlFor="content-set-description" label="Descripción" hint="Opcional"><Textarea id="content-set-description" value={values.description} disabled={disabled} placeholder="Qué reúne este conjunto y para qué conviene reutilizarlo." onChange={(event) => onChange("description", event.target.value)} /></Field></div></div>{saveState === "error" && <div className={styles.errorBanner} role="alert"><strong>No se pudo guardar el conjunto local.</strong><span>Conservamos tus cambios para que puedas reintentar.</span><Button size="sm" variant="outline" onClick={onRetry} disabled={disabled}>Reintentar</Button></div>}{saveState === "saved" && <div className={styles.successBanner} role="status">Conjunto guardado localmente. Puedes retomarlo desde esta vista.</div>}<div className={styles.formActions}><Button variant="outline" type="button" disabled={saveState === "saving"} onClick={onCancel} startIcon={<LucideIcon name="arrow-left" size={16} />}>Volver al propósito</Button><Button type="button" loading={saveState === "saving"} disabled={!validation.isReady || !canEdit} onClick={onSave} startIcon={<LucideIcon name="save" size={16} />}>{saveState === "saved" ? "Guardar cambios" : "Guardar conjunto"}</Button></div></section>;
}
