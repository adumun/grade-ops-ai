"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import AppShell from "@/components/shell/AppShell";
import Button from "@/components/ds/Button";
import LucideIcon from "@/components/ds/LucideIcon";
import Page from "@/components/shell/Page";
import PageHeader from "@/components/shell/PageHeader";
import { useShellConfig, useDemoState } from "@/components/shell/ShellContext";
import AssessmentProgress from "./components/AssessmentProgress";
import AssessmentPurposeSection from "./components/AssessmentPurposeSection";
import ReadinessSummary from "./components/ReadinessSummary";
import { useAssessmentAuthoringPage } from "./hooks/useAssessmentAuthoringPage";
import styles from "./components/AssessmentAuthoring.module.css";
import type { AssessmentAccess } from "./domain/types";

export default function AssessmentPurposePage({ access = "editable", simulateSaveError = false }: { access?: AssessmentAccess; simulateSaveError?: boolean }) {
  useShellConfig({ title: "Nueva evaluación", subtitle: "Define el punto de partida" });
  const { demoState } = useDemoState();
  const router = useRouter();
  const view = useAssessmentAuthoringPage(access, simulateSaveError);
  const isReadOnly = access === "read-only" || demoState === "readonly";

  if (view.dataState.status === "loading") return <AppShell><Page><PageHeader eyebrow="Nueva evaluación · Vista previa local" title="Propósito" description="Cargando el borrador local…" /><div className={styles.loadingState} aria-busy="true" aria-label="Cargando propósito"><LucideIcon name="sparkles" size={28} /><p>Cargando…</p></div></Page></AppShell>;
  if (view.dataState.status === "error") return <AppShell><Page><PageHeader eyebrow="Nueva evaluación · Vista previa local" title="Propósito" description="No se pudo cargar el borrador." /><div className={styles.errorState} role="alert"><LucideIcon name="alert-triangle" size={28} color="var(--danger-600)" /><h2>No pudimos cargar este borrador</h2><p>{view.dataState.message}</p><Button onClick={view.retryLoad}>Reintentar</Button></div></Page></AppShell>;
  if (access === "permission-denied" || demoState === "permission") return <AppShell><Page><PageHeader eyebrow="Nueva evaluación · Vista previa local" title="Propósito" description="Define el punto de partida" /><div className={styles.permissionState} role="alert"><LucideIcon name="lock" size={28} /><h2>No tienes permisos para editar</h2><p>Esta vista es de solo consulta para tu rol actual.</p><Link className={styles.backLink} href="/preview/assessments">Volver a Evaluaciones</Link></div></Page></AppShell>;
  return <AppShell><Page><PageHeader eyebrow="Nueva evaluación · Vista previa local" title="Propósito de la evaluación" description="Guarda una base mínima y continúa cuando estés listo." actions={<Link className={styles.secondaryLink} href="/preview/assessments">Volver a Evaluaciones</Link>} /><AssessmentProgress />{isReadOnly && <div className={styles.readonlyNotice} role="status">Solo lectura: puedes revisar el borrador, pero no modificarlo ni guardarlo.</div>}<div className={styles.purposeLayout}><AssessmentPurposeSection values={view.draft.values} validation={view.draft.validation} canEdit={view.draft.canEdit && !isReadOnly} saveState={view.draft.saveState} onChange={view.draft.update} onSave={() => { void view.draft.save(); }} onRetry={() => { void view.draft.save(); }} onCancel={() => router.push("/preview/assessments")} /><ReadinessSummary validation={view.draft.validation} /></div></Page></AppShell>;
}
