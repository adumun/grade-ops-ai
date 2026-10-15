import Badge from "@/components/ds/Badge";
import Button from "@/components/ds/Button";
import LucideIcon from "@/components/ds/LucideIcon";
import type { ContentSet } from "../domain/types";
import styles from "./ContentSet.module.css";

type Props = {
  contentSets: ContentSet[];
  selectedIds: string[];
  canEdit: boolean;
  onRemove: (id: string) => void;
};

function formatUpdatedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Actualización reciente";
  return `Actualizado el ${new Intl.DateTimeFormat("es-CL", { day: "numeric", month: "short" }).format(date)}`;
}

export default function LinkedContentList({ contentSets, selectedIds, canEdit, onRemove }: Props) {
  const uniqueContentSets = Array.from(new Map(contentSets.map((contentSet) => [contentSet.id, contentSet])).values());
  const linked = selectedIds.map((id) => uniqueContentSets.find((contentSet) => contentSet.id === id)).filter((contentSet): contentSet is ContentSet => Boolean(contentSet));

  return (
    <section className={styles.linkedSection} aria-labelledby="linked-content-title">
      <div className={styles.linkedHeader}>
        <div>
          <span className={styles.kicker}>Contenido de esta evaluación</span>
          <h2 id="linked-content-title">Contenidos vinculados</h2>
          <p>Estos recursos estarán disponibles para definir objetivos y construir la rúbrica.</p>
        </div>
        <Badge tone={linked.length > 0 ? "success" : "neutral"}>{linked.length} vinculado{linked.length === 1 ? "" : "s"}</Badge>
      </div>
      {linked.length === 0 ? (
        <div className={styles.linkedEmpty} role="status">
          <span className={styles.linkedEmptyIcon}><LucideIcon name="library" size={24} /></span>
          <div><strong>Aún no hay contenidos vinculados</strong><p>Selecciona uno o más contenidos desde la biblioteca para comenzar.</p></div>
        </div>
      ) : (
        <ul className={styles.linkedList}>
          {linked.map((contentSet) => (
            <li key={contentSet.id} className={styles.linkedItem}>
              <span className={styles.linkedItemIcon}><LucideIcon name="library" size={18} /></span>
              <div className={styles.linkedItemBody}>
                <strong>{contentSet.name}</strong>
                <span>{contentSet.materials.length} material{contentSet.materials.length === 1 ? "" : "es"} · {formatUpdatedAt(contentSet.updatedAt)}</span>
                {contentSet.description && <small>{contentSet.description}</small>}
              </div>
              <Badge tone="neutral">Reutilizable</Badge>
              <Button type="button" variant="ghost" size="sm" disabled={!canEdit} onClick={() => onRemove(contentSet.id)}>Quitar</Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
