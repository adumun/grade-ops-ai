import Badge from "@/components/ds/Badge";
import Button from "@/components/ds/Button";
import LucideIcon from "@/components/ds/LucideIcon";
import type { ContentSet } from "../domain/types";
import type { ContentSetMode } from "../hooks/useContentSetDraft";
import styles from "./ContentSet.module.css";

type Props = {
  contentSets: ContentSet[];
  selectedIds: string[];
  mode: ContentSetMode;
  canEdit: boolean;
  onSelect: (id: string) => void;
  onCreate: () => void;
};

export default function ContentSetLibrary({ contentSets, selectedIds, mode, canEdit, onSelect, onCreate }: Props) {
  return (
    <section className={styles.librarySection} aria-labelledby="content-source-title">
      <div className={styles.libraryHeader}>
        <div>
          <span className={styles.kicker}>Origen del contenido</span>
          <h2 id="content-source-title">Selecciona contenidos para esta evaluación</h2>
          <p>Usa un conjunto reutilizable existente o crea uno nuevo. La evaluación solo guarda la asociación.</p>
        </div>
        <Badge tone={mode === "existing" ? "success" : "neutral"}>{mode === "existing" ? `${selectedIds.length} conjunto${selectedIds.length === 1 ? "" : "s"} vinculado${selectedIds.length === 1 ? "" : "s"}` : "Nuevo conjunto"}</Badge>
      </div>
      <div className={styles.libraryChoices}>
        <div className={styles.libraryChoiceList} role="list" aria-label="Conjuntos reutilizables disponibles">
          {contentSets.map((contentSet) => (
            <button
              key={contentSet.id}
              type="button"
              className={styles.libraryChoice}
              data-selected={selectedIds.includes(contentSet.id)}
              aria-pressed={selectedIds.includes(contentSet.id)}
              disabled={!canEdit}
              onClick={() => onSelect(contentSet.id)}
            >
              <span className={styles.libraryChoiceIcon}><LucideIcon name="library" size={18} /></span>
              <span className={styles.libraryChoiceBody}><strong>{contentSet.name}</strong><small>{contentSet.materials.length} materiales · {contentSet.description}</small></span>
              {selectedIds.includes(contentSet.id) && <LucideIcon name="clipboard-check" size={18} />}
            </button>
          ))}
        </div>
        <div className={styles.libraryCreate}>
          <span className={styles.libraryCreateIcon}><LucideIcon name="plus" size={20} /></span>
          <div><strong>Crear un conjunto nuevo</strong><p>Define el nombre y agrega materiales sin modificar los conjuntos existentes.</p></div>
          <Button type="button" size="md" variant="secondary" disabled={!canEdit} onClick={onCreate} startIcon={<LucideIcon name="plus" size={16} />}>Crear nuevo</Button>
        </div>
      </div>
    </section>
  );
}
