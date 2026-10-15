"use client";

import { useMemo, useState } from "react";
import Badge from "@/components/ds/Badge";
import Button from "@/components/ds/Button";
import Input from "@/components/ds/Input";
import LucideIcon from "@/components/ds/LucideIcon";
import type { ContentSet } from "../domain/types";
import styles from "./ContentSet.module.css";

type Props = {
  contentSets: ContentSet[];
  selectedIds: string[];
  canEdit: boolean;
  onSelect: (id: string) => void;
  onCreate: () => void;
};

type Filter = "all" | "with-materials" | "recent";

export default function ContentSetLibrary({ contentSets, selectedIds, canEdit, onSelect, onCreate }: Props) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
    const uniqueContentSets = useMemo(() => Array.from(new Map(contentSets.map((contentSet) => [contentSet.id, contentSet])).values()), [contentSets]);
  const visibleContentSets = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const recentThreshold = new Date();
    recentThreshold.setDate(recentThreshold.getDate() - 30);
    return contentSets.filter((contentSet) => {
      const matchesQuery = !normalizedQuery || `${contentSet.name} ${contentSet.description}`.toLowerCase().includes(normalizedQuery);
      const matchesFilter = filter === "all"
        || (filter === "with-materials" && contentSet.materials.length > 0)
        || (filter === "recent" && new Date(contentSet.updatedAt) >= recentThreshold);
      return matchesQuery && matchesFilter;
    });
  }, [uniqueContentSets, filter, query]);

  return (
    <section className={styles.librarySection} aria-labelledby="content-library-title">
      <div className={styles.libraryHeader}>
        <div>
          <span className={styles.kicker}>Biblioteca de contenidos</span>
          <h2 id="content-library-title">Selecciona contenidos</h2>
          <p>Elige uno o más contenidos reutilizables para esta evaluación. La selección no duplica ni modifica sus recursos.</p>
        </div>
        <Badge tone="neutral">{contentSets.length} disponibles</Badge>
      </div>

      <div className={styles.libraryToolbar}>
        <label className={styles.librarySearchLabel} htmlFor="content-library-search">Buscar contenidos</label>
        <Input id="content-library-search" value={query} placeholder="Busca por nombre o descripción" icon={<LucideIcon name="search" size={16} />} onChange={(event) => setQuery(event.target.value)} />
        <div className={styles.libraryFilters} aria-label="Filtrar contenidos">
          {([["all", "Todos"], ["with-materials", "Con materiales"], ["recent", "Recientes"]] as const).map(([value, label]) => (
            <button key={value} type="button" className={styles.libraryFilter} data-active={filter === value} onClick={() => setFilter(value)}>{label}</button>
          ))}
        </div>
      </div>

      <div className={styles.libraryList} role="list" aria-label="Contenidos reutilizables disponibles">
        {visibleContentSets.length === 0 ? (
          <div className={styles.libraryEmpty} role="status"><LucideIcon name="search-x" size={24} /><strong>No encontramos contenidos</strong><p>Prueba con otro término o crea un contenido nuevo.</p></div>
        ) : visibleContentSets.map((contentSet) => {
          const isSelected = selectedIds.includes(contentSet.id);
          return (
            <button key={contentSet.id} type="button" className={styles.libraryItem} data-selected={isSelected} aria-pressed={isSelected} disabled={!canEdit} onClick={() => onSelect(contentSet.id)}>
              <span className={styles.libraryCheckbox} aria-hidden="true">{isSelected && <LucideIcon name="check" size={14} />}</span>
              <span className={styles.libraryItemBody}><strong>{contentSet.name}</strong><span>{contentSet.materials.length} material{contentSet.materials.length === 1 ? "" : "es"} · Contenido reutilizable</span>{contentSet.description && <small>{contentSet.description}</small>}</span>
              <span className={styles.libraryItemAction}>{isSelected ? "Seleccionado" : "Seleccionar"}</span>
            </button>
          );
        })}
      </div>

      <div className={styles.libraryCreate}>
        <span className={styles.libraryCreateIcon}><LucideIcon name="plus" size={20} /></span>
        <div><strong>¿No encuentras lo que necesitas?</strong><p>Crea un contenido nuevo y quedará vinculado a esta evaluación.</p></div>
        <Button type="button" size="md" variant="secondary" disabled={!canEdit} onClick={onCreate} startIcon={<LucideIcon name="plus" size={16} />}>Crear contenido nuevo</Button>
      </div>
    </section>
  );
}
