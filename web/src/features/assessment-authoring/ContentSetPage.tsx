"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import AppShell from "@/components/shell/AppShell";
import Badge from "@/components/ds/Badge";
import Button from "@/components/ds/Button";
import LucideIcon from "@/components/ds/LucideIcon";
import Page from "@/components/shell/Page";
import PageHeader from "@/components/shell/PageHeader";
import PageNotFound from "@/components/shell/PageNotFound";
import { useDemoState, useShellConfig } from "@/components/shell/ShellContext";
import ContentSetSection from "./components/ContentSetSection";
import MaterialList from "./components/MaterialList";
import MaterialUploader from "./components/MaterialUploader";
import AssessmentProgress from "./components/AssessmentProgress";
import { useContentSetPage } from "./hooks/useContentSetPage";
import styles from "./components/ContentSet.module.css";
import featureStyles from "./components/AssessmentAuthoring.module.css";
import type { AssessmentAccess } from "./domain/types";

export default function ContentSetPage({ access = "editable", simulateSaveError = false }: { access?: AssessmentAccess; simulateSaveError?: boolean }) {
  useShellConfig({ title: "Nueva evaluación", subtitle: "Contenidos reutilizables" });
  const { demoState } = useDemoState();
  const router = useRouter();
  const view = useContentSetPage(access, simulateSaveError);
  const isReadOnly = access === "read-only" || demoState === "readonly";
  const canEdit = view.draft.canEdit && !isReadOnly;
  if (view.dataState.status === "loading") return <AppShell><Page><PageHeader eyebrow="Nueva evaluación · Vista previa local" title="Contenidos y materiales" description="Cargando el conjunto local…" /><div className={featureStyles.loadingState} aria-busy="true" aria-label="Cargando contenidos"><LucideIcon name="sparkles" size={28} /><p>Cargando…</p></div></Page></AppShell>;
  if (view.dataState.status === "error") return <AppShell><Page><PageHeader eyebrow="Nueva evaluación · Vista previa local" title="Contenidos y materiales" description="No se pudo cargar el conjunto local." /><div className={featureStyles.errorState} role="alert"><LucideIcon name="alert-triangle" size={28} color="var(--danger-600)" /><h2>No pudimos cargar tus contenidos</h2><p>{view.dataState.message}</p><Button onClick={view.retryLoad}>Reintentar</Button></div></Page></AppShell>;
  if (access === "permission-denied" || demoState === "permission") return <AppShell><Page><PageHeader eyebrow="Nueva evaluación · Vista previa local" title="Contenidos y materiales" description="Revisa el conjunto, si tu rol tiene acceso." /><div className={featureStyles.permissionState} role="alert"><LucideIcon name="lock" size={28} /><h2>No tienes permisos para editar contenidos</h2><p>Este conjunto queda disponible en modo consulta para tu rol actual.</p><Link className={featureStyles.backLink} href="/preview/assessments/new/purpose">Volver al propósito</Link></div></Page></AppShell>;
  return <AppShell><Page><PageHeader eyebrow="Nueva evaluación · Vista previa local" title="Contenidos y materiales" description="Construye un conjunto reutilizable antes de definir objetivos." actions={<Link className={featureStyles.secondaryLink} href="/preview/assessments/new/purpose">Volver al propósito</Link>} /><AssessmentProgress currentStage="content" />{isReadOnly && <div className={featureStyles.readonlyNotice} role="status">Solo lectura: puedes revisar el conjunto, pero no modificarlo ni guardarlo.</div>}<div className={styles.contentLayout}><ContentSetSection values={view.draft.values} validation={view.draft.validation} canEdit={canEdit} saveState={view.draft.saveState} onChange={view.draft.update} onSave={() => { void view.draft.save(); }} onRetry={() => { void view.draft.save(); }} onCancel={() => router.push("/preview/assessments/new/purpose")} /><MaterialUploader fixtures={view.draft.fixtures} disabled={!canEdit || view.draft.saveState === "saving"} onAdd={view.draft.addMaterial} /><section className={styles.materialsSection} aria-labelledby="materials-title"><div className={styles.materialsHeader}><div><h2 id="materials-title">Materiales del conjunto</h2><p>{view.draft.materials.length === 0 ? "Todavía no hay materiales." : `${view.draft.materials.length} material${view.draft.materials.length === 1 ? "" : "es"} agregado${view.draft.materials.length === 1 ? "" : "s"}.`}</p></div><Badge tone="neutral">Demo local · borrador</Badge></div><MaterialList materials={view.draft.materials} disabled={!canEdit || view.draft.saveState === "saving"} onRemove={view.draft.removeMaterial} onMove={view.draft.reorderMaterial} /></section><div className={styles.futureAction}><p>Los contenidos están listos para vincularlos con objetivos medibles.</p><Link href="/preview/assessments/new/objectives">Continuar a objetivos</Link></div></div></Page></AppShell>;
}

export function ContentSetFutureRoute() {
  return <AppShell><Page><PageNotFound requestedPath="/preview/assessments/new/objectives" areaLabel="Objetivos" /></Page></AppShell>;
}
