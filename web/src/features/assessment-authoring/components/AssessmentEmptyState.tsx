import Link from "next/link";
import LucideIcon from "@/components/ds/LucideIcon";
import styles from "./AssessmentAuthoring.module.css";

export default function AssessmentEmptyState() {
  return <section className={styles.emptyState} aria-labelledby="assessment-empty-title"><div className={styles.emptyIcon}><LucideIcon name="file-pen-line" size={32} /></div><span className={styles.kicker}>Entrada sin datos · Vista previa local</span><h2 id="assessment-empty-title">Aún no tienes evaluaciones configuradas</h2><p>Empieza por definir el propósito de una evaluación. Después podrás sumar contenidos y preparar el resto del flujo.</p><p className={styles.secondaryCopy}>La institución, el curso, la sección y los alumnos se configuran más adelante, al asignar la evaluación.</p><Link className={styles.primaryLink} href="/preview/assessments/new/purpose" aria-label="Crear mi primera evaluación">Crear mi primera evaluación</Link><p className={styles.localNote}>Datos demo/locales · todavía no hay información real conectada.</p></section>;
}
