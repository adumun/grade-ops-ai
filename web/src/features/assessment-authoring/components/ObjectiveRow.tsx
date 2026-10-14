import Badge, { type BadgeTone } from "@/components/ds/Badge";
import Button from "@/components/ds/Button";
import IconButton from "@/components/ds/IconButton";
import LucideIcon from "@/components/ds/LucideIcon";
import { isObjectiveProposal } from "../domain/objectiveRules";
import type { Material, Objective } from "../domain/types";
import EvidenceExpectation from "./EvidenceExpectation";
import styles from "./Objectives.module.css";

const STATUS: Record<Objective["status"], { label: string; tone: BadgeTone }> = { draft: { label: "Borrador", tone: "neutral" }, ready: { label: "Listo para la siguiente etapa", tone: "success" }, needs_review: { label: "Requiere revisión", tone: "warning" } };

export default function ObjectiveRow({ objective, materials, disabled, onEdit, onRemove, onDecision }: { objective: Objective; materials: Material[]; disabled: boolean; onEdit: () => void; onRemove: () => void; onDecision: (decision: "accepted" | "rejected") => void }) {
  const proposal = isObjectiveProposal(objective);
  const linkedMaterials = materials.filter((material) => objective.materialIds.includes(material.id));
  const decisionLabel = objective.aiDecision === "accepted" ? "Propuesta aceptada" : objective.aiDecision === "edited" ? "Propuesta editada" : objective.aiDecision === "rejected" ? "Propuesta rechazada" : "Propuesta pendiente";
  return <li className={styles.objectiveRow}>
    <div className={styles.objectiveMain}><div className={styles.rowTitle}><h3>{objective.title || "Objetivo sin título"}</h3><Badge tone={STATUS[objective.status].tone}>{STATUS[objective.status].label}</Badge></div>{objective.description && <p className={styles.objectiveDescription}>{objective.description}</p>}<EvidenceExpectation objective={objective} /><div className={styles.metadata}><span>Origen: {objective.source === "demo-ai" ? "IA demo" : "Manual"}</span>{objective.source === "demo-ai" && <span>{decisionLabel}</span>}{objective.source === "demo-ai" && <span>Incertidumbre: propuesta basada en material demo</span>}</div><div className={styles.linkedMaterials}><strong>Materiales vinculados</strong>{linkedMaterials.length > 0 ? <ul>{linkedMaterials.map((material) => <li key={material.id}>{material.name}</li>)}</ul> : <span>Sin material asociado</span>}</div>{proposal && <div className={styles.proposalActions}><p>Acción humana pendiente: revisa la propuesta antes de convertirla en un objetivo usable.</p>{objective.aiDecision === "pending" && <><Button size="sm" disabled={disabled} onClick={() => onDecision("accepted")}>Aceptar propuesta</Button><Button size="sm" variant="outline" disabled={disabled} onClick={onEdit}>Editar propuesta</Button><Button size="sm" variant="ghost" disabled={disabled} onClick={() => onDecision("rejected")}>Rechazar propuesta</Button></>}</div>}</div>
    <div className={styles.rowActions}>{!proposal && <><IconButton label={`Editar ${objective.title}`} disabled={disabled} onClick={onEdit}><LucideIcon name="file-pen-line" size={16} /></IconButton><IconButton label={`Eliminar ${objective.title}`} disabled={disabled} onClick={onRemove}><LucideIcon name="minus" size={16} /></IconButton></>}</div>
  </li>;
}
