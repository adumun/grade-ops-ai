import { useState } from "react";
import Button from "@/components/ds/Button";
import Field from "@/components/ds/Field";
import Input from "@/components/ds/Input";
import LucideIcon from "@/components/ds/LucideIcon";
import Textarea from "@/components/ds/Textarea";
import type { AssessmentDraftValues, AssessmentValidation } from "../domain/types";
import styles from "./AssessmentAuthoring.module.css";

type Props = {
  values: AssessmentDraftValues;
  validation: AssessmentValidation;
  validationRequested: boolean;
  canEdit: boolean;
  saveState: "idle" | "saving" | "saved" | "error";
  onChange: (field: keyof AssessmentDraftValues, value: string) => void;
  onSave: () => void;
  onRetry: () => void;
  onCancel: () => void;
  onContinue?: () => void;
  showActions?: boolean;
};

export default function AssessmentPurposeSection({
  values,
  validation,
  validationRequested,
  canEdit,
  saveState,
  onChange,
  onRetry,
  onCancel,
  onContinue,
  showActions = true,
}: Props) {
  const disabled = !canEdit || saveState === "saving";
  const [aiMode, setAiMode] = useState<"idle" | "confirm" | "generated">("idle");
  const [generatedPurpose, setGeneratedPurpose] = useState("");

  const generateDraft = () => {
    const title = values.title.trim() || "esta evaluación";
    const topic = values.topic.trim() || "la temática definida";
    const draftContext = values.purpose.trim() ? " Considerando también tu borrador: «" + values.purpose.trim() + "»." : "";\n    setGeneratedPurpose("Que el estudiante comprenda " + topic.toLowerCase() + " y pueda demostrarlo mediante una producción relacionada con «" + title + "»." + draftContext);
    setAiMode("confirm");
  };

  const confirmGeneration = () => {
    onChange("purpose", generatedPurpose);
    setAiMode("generated");
  };

  const acceptGenerated = () => setAiMode("idle");
  const editGenerated = () => setAiMode("idle");

  return (
    <section className={styles.formSection} aria-labelledby="purpose-title">
      <div className={styles.sectionHeading}>
        <div>
          <span className={styles.kicker}>Paso 1 de 3</span>
          <h2 id="purpose-title">Define el propósito</h2>
          <p>Un punto de partida breve ayuda a mantener coherente la evaluación.</p>
        </div>
      </div>
      <div className={styles.formGrid}>
        <Field htmlFor="assessment-title" label="Título" required error={validationRequested ? validation.errors.title : undefined}>
          <Input id="assessment-title" value={values.title} disabled={disabled} placeholder="Ej. Diagnóstico de funciones" onChange={(event) => onChange("title", event.target.value)} />
        </Field>
        <Field htmlFor="assessment-topic" label="Temática" required error={validationRequested ? validation.errors.topic : undefined}>
          <Input id="assessment-topic" value={values.topic} disabled={disabled} placeholder="Ej. Funciones y modularidad" onChange={(event) => onChange("topic", event.target.value)} />
        </Field>
        <div className={styles.fullField}>
          <Field htmlFor="assessment-purpose" label="Propósito pedagógico" required error={validationRequested ? validation.errors.purpose : undefined}>
            <Textarea id="assessment-purpose" value={values.purpose} disabled={disabled || aiMode === "generated"} readOnly={aiMode === "generated"} placeholder="¿Qué quieres que el estudiante pueda demostrar?" onChange={(event) => onChange("purpose", event.target.value)} />
          </Field>
          <div className={styles.aiPurposeActions}>
            {aiMode === "generated" ? (
              <>
                <span className={styles.aiReadonlyNote}><LucideIcon name="lock" size={14} /> Propuesta generada por IA. Revísala antes de aceptarla.</span>
                <div className={styles.aiDecisionActions}>
                  <Button type="button" size="sm" variant="outline" onClick={acceptGenerated}><LucideIcon name="clipboard-check" size={15} /> Aceptar propuesta</Button>
                  <Button type="button" size="sm" variant="secondary" onClick={editGenerated}><LucideIcon name="file-pen-line" size={15} /> Editar</Button>
                </div>
              </>
            ) : (
              <Button type="button" size="sm" variant="secondary" disabled={disabled || !values.title.trim() || !values.topic.trim()} onClick={generateDraft} startIcon={<LucideIcon name="sparkles" size={15} />}>Generar con IA</Button>
            )}
          </div>
          {aiMode === "confirm" && (
            <div className={styles.aiConfirmation} role="status">
              <div><strong>¿Reemplazar el propósito actual?</strong><span>La IA generará una nueva propuesta usando el título, la temática y el texto que ya escribiste.</span></div>
              <div className={styles.aiDecisionActions}>
                <Button type="button" size="sm" variant="outline" onClick={() => setAiMode("idle")}>Cancelar</Button>
                <Button type="button" size="sm" onClick={confirmGeneration} startIcon={<LucideIcon name="sparkles" size={15} />}>Sí, generar</Button>
              </div>
            </div>
          )}
        </div>
      </div>
      {saveState === "error" && <div className={styles.errorBanner} role="alert"><strong>No se pudo guardar el borrador local.</strong><span>Conservamos lo que escribiste para que puedas reintentar.</span><Button size="sm" variant="outline" onClick={onRetry} disabled={disabled}>Reintentar</Button></div>}
      {saveState === "saved" && <div className={styles.successBanner} role="status">Borrador guardado localmente. Puedes volver a Evaluaciones y retomarlo.</div>}
      {showActions && <div className={styles.formActions}><Button variant="outline" type="button" disabled={saveState === "saving"} onClick={onCancel} startIcon={<LucideIcon name="arrow-left" size={16} />}>Volver a evaluaciones</Button><Button type="button" loading={saveState === "saving"} disabled={!canEdit} onClick={onSave} startIcon={<LucideIcon name="save" size={16} />}>{saveState === "saved" ? "Guardar cambios" : "Guardar borrador"}</Button>{onContinue && <Button type="button" variant="secondary" disabled={!canEdit || saveState === "saving"} onClick={onContinue} endIcon={<LucideIcon name="arrow-right" size={16} />}>Continuar a contenidos</Button>}</div>}
    </section>
  );
}
