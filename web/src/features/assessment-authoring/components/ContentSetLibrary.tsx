import Badge from "@/components/ds/Badge";
import Button from "@/components/ds/Button";
import LucideIcon from "@/components/ds/LucideIcon";
import type { ContentSet } from "../domain/types";
import type { ContentSetMode } from "../hooks/useContentSetDraft";
import styles from "./ContentSet.module.css";

type Props = {
  contentSets: ContentSet[];
  selectedId?: string;
  mode: ContentSetMode;
  canEdit: boolean;
  onSelect: (id: string) => void;
  onCreate: () => void;
};

export default function ContentSetLibrary({ contentSets, selectedId, mode, canEdit, onSelect, onCreate }: Props) {
  return (
    <section className={styles.librarySection} aria-labelledby="content-source-title">
      <div className={styles.libraryHeader}>
        <div>
          <span className={styles.kicker}>Origen del contenido</span>
          <h2 id="content-source-title">Asocia contenidos a esta evaluación</h2>
          <p>Usa un conjunto reutilizable existente o crea uno nuevo. La evaluación solo guarda la asociación.</p>
        </div>
        <Badge tone={mode === "existing" ? "success" : "neutral"}>{mode === "existing" ? "Conjunto seleccionado" : "Nuevo conjunto"}</Badge>
      </div>
      <div className={styles.libraryChoices}>
        <div className={styles.libraryChoiceList} role="list" aria-label="Conjuntos reutilizables disponibles">
          {contentSets.map((contentSet) => (
            <button
              key={contentSet.id}
              type="button"
              className={styles.libraryChoice}
              data-selected={selectedId === contentSet.id}
              aria-pressed={selectedId === contentSet.id}
              disabled={!canEdit}
              onClick={() => onSelect(contentSet.id)}
            >
              <span className={styles.libraryChoiceIcon}><LucideIcon name="library" size={18} /></span>
              <span className={styles.libraryChoiceBody}><strong>{contentSet.name}</strong><small>{contentSet.materials.length} materiales · {contentSet.description}</small></span>
              {selectedId === contentSet.id && <LucideIcon name="clipboard-check" size={18} />}
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
