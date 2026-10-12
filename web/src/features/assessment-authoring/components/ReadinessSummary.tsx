import Badge from "@/components/ds/Badge";
import type { AssessmentValidation } from "../domain/types";
import styles from "./AssessmentAuthoring.module.css";

export default function ReadinessSummary({ validation }: { validation: AssessmentValidation }) {
  return <aside className={styles.readiness} aria-labelledby="readiness-title"><div className={styles.sectionHeading}><div><span className={styles.kicker}>Antes de continuar</span><h2 id="readiness-title">Resumen de preparación</h2></div><Badge tone={validation.isReady ? "success" : "warning"}>{validation.isReady ? "Listo para guardar" : "Falta el título"}</Badge></div>{validation.errors.title ? <p className={styles.errorText}>{validation.errors.title}</p> : <p className={styles.successText}>El borrador puede guardarse y retomarse desde Evaluaciones.</p>}{validation.warnings.length > 0 && <ul className={styles.warningList}>{validation.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>}<p className={styles.scopeNote}>Los objetivos, materiales, preguntas y publicación pertenecen a etapas posteriores.</p></aside>;
}
