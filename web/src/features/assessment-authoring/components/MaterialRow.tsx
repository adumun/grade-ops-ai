import Badge, { type BadgeTone } from "@/components/ds/Badge";
import IconButton from "@/components/ds/IconButton";
import LucideIcon from "@/components/ds/LucideIcon";
import type { Material } from "../domain/types";
import styles from "./ContentSet.module.css";

const STATUS: Record<Material["status"], { label: string; tone: BadgeTone; help: string }> = {
  ready: { label: "Listo", tone: "success", help: "Disponible para usar en la siguiente etapa." },
  processing: { label: "Procesando", tone: "warning", help: "La extracción demo todavía está pendiente." },
  error: { label: "Revisar", tone: "danger", help: "La revisión demo falló; puedes retirarlo y elegir otro material." },
  unsupported: { label: "No compatible", tone: "neutral", help: "Este formato queda visible, pero no puede procesarse todavía." },
};

export default function MaterialRow({ material, index, total, disabled, onRemove, onMove }: { material: Material; index: number; total: number; disabled: boolean; onRemove: () => void; onMove: (direction: -1 | 1) => void }) {
  const status = STATUS[material.status];
  return <li className={styles.materialRow}><div className={styles.materialType} aria-hidden="true">{material.type.toUpperCase()}</div><div className={styles.materialDetails}><strong>{material.name}</strong><span>{material.sourceLabel}</span>{material.description && <small>{material.description}</small>}</div><div className={styles.materialStatus}><Badge tone={status.tone}>{status.label}</Badge><span>{status.help}</span></div><div className={styles.rowActions}><IconButton label={`Subir ${material.name}`} disabled={disabled || index === 0} onClick={() => onMove(-1)}><LucideIcon name="arrow-left" size={16} /></IconButton><IconButton label={`Bajar ${material.name}`} disabled={disabled || index === total - 1} onClick={() => onMove(1)}><LucideIcon name="arrow-left" size={16} className={styles.moveDownIcon} /></IconButton><IconButton label={`Eliminar ${material.name}`} disabled={disabled} onClick={onRemove}><LucideIcon name="minus" size={16} /></IconButton></div></li>;
}
