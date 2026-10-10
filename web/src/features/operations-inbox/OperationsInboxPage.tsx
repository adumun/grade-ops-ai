"use client";

import Badge, { type BadgeTone } from "@/components/ds/Badge";
import Button from "@/components/ds/Button";
import Card from "@/components/ds/Card";
import Input from "@/components/ds/Input";
import LucideIcon from "@/components/ds/LucideIcon";
import Select from "@/components/ds/Select";
import { CLASS_OPTIONS, DATE_OPTIONS, QUEUES, STATUS_OPTIONS, SUBJECT_OPTIONS, type DemoOperation } from "./data";
import { useOperationsInbox } from "./useOperationsInbox";
import styles from "./OperationsInboxPage.module.css";
import { useShellConfig } from "@/components/shell/ShellContext";
import AppShell from "@/components/shell/AppShell";
import Page from "@/components/shell/Page";
import PageHeader from "@/components/shell/PageHeader";
import { FilterBar, FilterField } from "@/components/filters/FilterBar";
import RowActionGroup from "@/components/actions/RowActionGroup";

function toneForPriority(priority: DemoOperation["priority"]): BadgeTone {
  return priority === "urgent" ? "danger" : priority === "next" ? "warning" : "neutral";
}

function toneForStatus(status: string): BadgeTone {
  if (status.includes("IA")) return "info";
  if (status.includes("error") || status.includes("pendientes")) return "danger";
  if (status.includes("aprobación") || status.includes("Editado")) return "success";
  return "neutral";
}

function LoadingState() {
  return <div aria-label="Cargando Bandeja de Operaciones" aria-busy="true" className={styles.loadingStack}>{[1, 2, 3].map((item) => <div className={styles.skeleton} key={item}><span /><span /><span /></div>)}</div>;
}

function EmptyState({ filtered, onClear }: { filtered: boolean; onClear: () => void }) {
  return <div className={styles.emptyState}><LucideIcon name="clipboard-check" size={30} color="var(--brand)" /><h3>{filtered ? "No hay coincidencias" : "No hay operaciones pendientes"}</h3><p>{filtered ? "Prueba con otra búsqueda o limpia los filtros para volver a ver el trabajo disponible." : "Cuando una tarea necesite tu atención aparecerá en una de estas colas."}</p><Button variant="outline" onClick={onClear}>{filtered ? "Limpiar filtros" : "Ver todas las colas"}</Button></div>;
}

function OperationRow({ operation, disabled, loading, error, onAction, onContext, onRetry }: { operation: DemoOperation; disabled: boolean; loading: boolean; error: boolean; onAction: () => void; onContext: () => void; onRetry: () => void }) {
  const isReadOnly = operation.access === "read-only";
  return (
    <article className={styles.operationRow} aria-busy={loading}>
      <div className={styles.priority}><Badge tone={toneForPriority(operation.priority)} dot>{operation.priority === "urgent" ? "Urgente" : operation.priority === "next" ? "Próximo" : "Pendiente"}</Badge><span className={styles.priorityNumber}>{operation.priority === "urgent" ? "Prioridad alta" : operation.priority === "next" ? "Siguiente paso" : "Seguimiento"}</span></div>
      <div className={styles.rowMain}>
        <div className={styles.rowHeading}><LucideIcon name={operation.icon} size={20} color="var(--brand)" /><div><h3>{operation.title}</h3><p>{operation.context}</p></div></div>
        <p className={styles.reason}>{operation.reason}</p>
        <div className={styles.rowMeta}><Badge tone={toneForStatus(operation.status)}>{operation.status}</Badge>{isReadOnly && <Badge tone="neutral">Solo lectura</Badge>}<span className={styles.dueDate}>{operation.dueDate}</span></div>
        {error && <div role="alert" className={styles.actionError}><LucideIcon name="alert-triangle" size={16} /><span>No se pudo completar esta acción.</span><Button size="sm" variant="outline" onClick={onRetry}>Reintentar</Button></div>}
      </div>
      <RowActionGroup primaryLabel={isReadOnly ? "Sin permiso" : operation.primaryAction} primaryDisabled={disabled || isReadOnly} loading={loading} onPrimary={onAction} contextDisabled={loading} onContext={onContext} />
    </article>
  );
}

export default function OperationsInboxPage() {
  useShellConfig({ title: "Operaciones", subtitle: "Bandeja de trabajo docente" });
  const inbox = useOperationsInbox();
  const activeQueue = QUEUES.find((queue) => queue.id === inbox.activeQueue) ?? QUEUES[0];
  const isDataLoading = inbox.demoState === "loading";
  const isBlocked = isDataLoading || inbox.demoState === "readonly" || inbox.demoState === "permission";


  return (
    <AppShell><Page><PageHeader eyebrow="Operaciones docentes · Vista previa local" title="Bandeja de Operaciones" description="Encuentra el siguiente paso y decide con el contexto completo." />
          <div className={styles.contextBar}><div><span className={styles.contextLabel}>Contexto académico</span><strong>Todas mis clases</strong><small>2 clases · Segundo semestre 2026</small></div><Badge tone="info">Alcance global</Badge></div>
          <FilterBar ariaLabel="Filtros de operaciones" busy={isDataLoading} clearDisabled={isDataLoading || !inbox.hasFilters} onClear={inbox.clearFilters}>
            <FilterField label="Buscar operaciones"><Input aria-label="Buscar operaciones" placeholder="Título, clase, estado…" value={inbox.search} disabled={isDataLoading} onChange={(event) => inbox.setSearch(event.target.value)} icon={<LucideIcon name="search" size={16} />} /></FilterField>
            <FilterField label="Clase"><Select aria-label="Clase" disabled={isDataLoading} value={inbox.filters.className} onChange={(event) => inbox.setFilters({ ...inbox.filters, className: event.target.value })}>{CLASS_OPTIONS.map((option) => <option key={option}>{option}</option>)}</Select></FilterField>
            <FilterField label="Asignatura"><Select aria-label="Asignatura" disabled={isDataLoading} value={inbox.filters.subject} onChange={(event) => inbox.setFilters({ ...inbox.filters, subject: event.target.value })}>{SUBJECT_OPTIONS.map((option) => <option key={option}>{option}</option>)}</Select></FilterField>
            <FilterField label="Estado"><Select aria-label="Estado" disabled={isDataLoading} value={inbox.filters.status} onChange={(event) => inbox.setFilters({ ...inbox.filters, status: event.target.value })}>{STATUS_OPTIONS.map((option) => <option key={option}>{option}</option>)}</Select></FilterField>
            <FilterField label="Fecha"><Select aria-label="Fecha" disabled={isDataLoading} value={inbox.filters.date} onChange={(event) => inbox.setFilters({ ...inbox.filters, date: event.target.value as typeof inbox.filters.date })}>{DATE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</Select></FilterField>
          </FilterBar>
          {inbox.hasFilters && <div role="status" className={styles.filterSummary}>Mostrando coincidencias en {activeQueue.label.toLocaleLowerCase("es")}. <button type="button" className={styles.inlineButton} disabled={isDataLoading} onClick={inbox.clearFilters}>Limpiar búsqueda y filtros</button></div>}
          <section className={styles.summary} aria-label="Resumen de colas">
            {QUEUES.map((queue) => <button key={queue.id} type="button" className={`${styles.summaryCard} ${queue.id === inbox.activeQueue ? styles.summaryCardActive : ""}`} aria-label={`${queue.label}, ${inbox.queueCounts[queue.id]} pendientes`} aria-pressed={queue.id === inbox.activeQueue} onClick={() => inbox.setActiveQueue(queue.id)}><span><strong>{inbox.queueCounts[queue.id]}</strong><span>{queue.label}</span><small>pendientes</small></span><LucideIcon name={queue.id === "prepare" ? "calendar-clock" : queue.id === "review" ? "clipboard-check" : queue.id === "confirm" ? "file-pen-line" : "sparkles"} size={22} color="var(--brand)" /></button>)}
          </section>
          {inbox.demoState === "error" ? <div role="alert" className={styles.errorBanner}><LucideIcon name="alert-triangle" size={20} /><div><strong>No pudimos cargar la bandeja</strong><p>El modo local conserva tus controles para que puedas reintentar sin perder el contexto.</p><Button size="sm" onClick={() => inbox.changeDemoState("ready")}>Reintentar</Button></div></div> : <section className={styles.queueSection} aria-labelledby="operations-queue-title"><div className={styles.sectionHeader}><div><span className={styles.sectionKicker}>Trabajo pendiente</span><h2 id="operations-queue-title">{activeQueue.label}</h2><p>{activeQueue.description}</p></div><Badge tone="brand">{inbox.visibleOperations.length} visibles</Badge></div><div role="tablist" aria-label="Colas de operaciones" className={styles.queueTabs}>{QUEUES.map((queue) => <button key={queue.id} role="tab" type="button" aria-selected={queue.id === inbox.activeQueue} aria-controls={`${queue.id}-queue-panel`} onClick={() => inbox.setActiveQueue(queue.id)}>{queue.label}</button>)}</div>{isDataLoading ? <LoadingState /> : <div id={`${inbox.activeQueue}-queue-panel`} role="tabpanel" aria-label={`Cola ${activeQueue.label}`}>{inbox.visibleOperations.length === 0 ? <EmptyState filtered={inbox.hasFilters} onClear={inbox.clearFilters} /> : <div className={styles.queue}>{inbox.visibleOperations.map((operation) => <OperationRow key={operation.id} operation={operation} disabled={isBlocked} loading={inbox.actionLoadingId === operation.id} error={inbox.actionErrorId === operation.id} onAction={() => inbox.runAction(operation)} onContext={() => inbox.openContext(operation)} onRetry={() => inbox.runAction(operation, true)} />)}</div>}</div>}</section>}
          {inbox.demoState === "permission" && <div role="alert" className={styles.permissionBanner}><LucideIcon name="lock" size={19} /><div><strong>No tienes permisos para ejecutar operaciones</strong><p>Puedes consultar el contexto y el estado, pero la autoridad de la acción pertenece a otro rol.</p></div></div>}
          {inbox.contextTarget && <div role="status" className={styles.contextNotice}><span>Contexto simulado: <strong>{inbox.contextTarget.originPath}</strong>. Se conservan cola, búsqueda y filtros.</span><Button variant="outline" size="sm" onClick={inbox.returnToInbox}>Volver a la bandeja</Button></div>}
          <Card className={styles.notice}><Card.Body><span role="status" aria-live="polite">{inbox.notice}</span></Card.Body></Card>
      </Page></AppShell>
  );
}
