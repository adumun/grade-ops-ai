import { useState } from "react";
import Badge from "@/components/ds/Badge";
import Button from "@/components/ds/Button";
import type { RubricAiDecision } from "../domain/types";
import styles from "./Rubric.module.css";

export default function RubricAiProposal({ decision, disabled, onDecision }: { decision?: RubricAiDecision; disabled: boolean; onDecision: (decision: Exclude<RubricAiDecision, "pending">) => void }) {
  const [expanded, setExpanded] = useState(false);
  const label = decision === "accepted" ? "Propuesta aceptada" : decision === "edited" ? "Propuesta editada" : decision === "rejected" ? "Propuesta rechazada" : "Propuesta IA pendiente";
  return <section className={styles.aiProposal} aria-labelledby="rubric-ai-title"><div className={styles.sectionHeading}><div><span className={styles.kicker}>IA demo/local</span><h2 id="rubric-ai-title">{label}</h2></div><Badge tone={decision === "accepted" ? "success" : decision === "rejected" ? "neutral" : "warning"}>{decision ?? "pending"}</Badge></div><p>Propuesta simulada a partir de objetivos demo. No se consultó IA real y requiere decisión docente.</p><Button size="sm" variant="ghost" aria-expanded={expanded} onClick={() => setExpanded((value) => !value)}>{expanded ? "Ocultar origen" : "Ver origen e incertidumbre"}</Button>{expanded && <p className={styles.aiDetail}>Origen: fixtures locales · Incertidumbre: la propuesta podría no representar el instrumento final.</p>}{decision === "pending" && <div className={styles.aiActions}><Button size="sm" disabled={disabled} onClick={() => onDecision("accepted")}>Aceptar propuesta</Button><Button size="sm" variant="secondary" disabled={disabled} onClick={() => onDecision("edited")}>Editar propuesta</Button><Button size="sm" variant="ghost" disabled={disabled} onClick={() => onDecision("rejected")}>Rechazar propuesta</Button></div>}</section>;
}
