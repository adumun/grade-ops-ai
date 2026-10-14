import type { Objective } from "../domain/types";
import styles from "./Objectives.module.css";

export default function EvidenceExpectation({ objective }: { objective: Objective }) {
  return <div className={styles.evidenceExpectation}><strong>Evidencia observable</strong><p>{objective.observableEvidence || "Sin evidencia observable definida."}</p></div>;
}
