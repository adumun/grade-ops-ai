import Badge from "@/components/ds/Badge";
import type { AssessmentValidation } from "../domain/types";
import styles from "./AssessmentAuthoring.module.css";

const labels: Record<string, string> = {
  title: "Completa el título de la evaluación.",
  topic: "Completa la temática que se evaluará.",
  purpose: "Completa el propósito o genera una propuesta con IA.",
};

export default function ReadinessSummary({ validation }: { validation: AssessmentValidation }) {
  const missing = Object.keys(validation.errors);
  const ready = validation.isReady;
  return (
    <aside className={styles.readiness} aria-labelledby="readiness-title">
      <div className={styles.sectionHeading}>
        <div><span className={styles.kicker}>Antes de continuar</span><h2 id="readiness-title">Resumen de preparación</h2></div>
        <Badge tone={ready ? "success" : "warning"}>{ready ? "Listo para guardar" : missing.length + " pendientes"}</Badge>
      </div>
      {ready ? <p className={styles.successText}>Los datos mínimos están completos. Puedes guardar el borrador y continuar.</p> : <><p className={styles.errorText}>Completa los datos obligatorios para guardar o avanzar.</p><ul className={styles.warningList}>{missing.map((field) => <li key={field}>{labels[field] ?? "Completa este campo obligatorio."}</li>)}</ul></>}
      <p className={styles.scopeNote}>Los materiales, objetivos, preguntas y publicación pertenecen a etapas posteriores.</p>
    </aside>
  );
}
