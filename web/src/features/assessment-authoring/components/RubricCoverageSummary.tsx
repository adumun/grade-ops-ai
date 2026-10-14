import Badge from "@/components/ds/Badge";
import type { RubricReadiness } from "../domain/types";
import styles from "./Rubric.module.css";

export default function RubricCoverageSummary({ readiness }: { readiness: RubricReadiness }) {
  return <aside className={styles.coverage} aria-labelledby="rubric-coverage-title"><div className={styles.sectionHeading}><div><span className={styles.kicker}>Cobertura y readiness</span><h2 id="rubric-coverage-title">Resumen de rúbrica</h2></div><Badge tone={readiness.isReady ? "success" : "warning"}>{readiness.isReady ? "Lista" : "Revisar"}</Badge></div><dl className={styles.metrics}><div><dt>Peso total</dt><dd>{readiness.weightTotal}%</dd></div><div><dt>Estado</dt><dd>{readiness.weightState === "correct" ? "Correcto" : readiness.weightState === "exceeded" ? "Excedido" : "Incompleto"}</dd></div><div><dt>Objetivos sin criterio</dt><dd>{readiness.objectivesWithoutCriterion.length}</dd></div><div><dt>Criterios duplicados</dt><dd>{readiness.duplicateCriteria.length}</dd></div></dl>{[...readiness.blockers, ...readiness.warnings].length > 0 && <ul className={styles.coverageIssues}>{[...readiness.blockers, ...readiness.warnings].map((issue) => <li key={issue}>{issue}</li>)}</ul>}<p>Una rúbrica incompleta puede guardarse como borrador, pero no queda lista para avanzar.</p></aside>;
}
