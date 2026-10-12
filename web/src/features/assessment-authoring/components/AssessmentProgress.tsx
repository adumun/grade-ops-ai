import Badge from "@/components/ds/Badge";
import styles from "./AssessmentAuthoring.module.css";

export default function AssessmentProgress() {
  return <div className={styles.progress} aria-label="Progreso de creación"><span className={styles.progressStepActive}><strong>1</strong> Propósito</span><span><strong>2</strong> Contenidos</span><span><strong>3</strong> Revisión</span><Badge tone="neutral">Borrador local</Badge></div>;
}
