"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import AppShell from "@/components/shell/AppShell";
import Button from "@/components/ds/Button";
import LucideIcon from "@/components/ds/LucideIcon";
import Page from "@/components/shell/Page";
import PageHeader from "@/components/shell/PageHeader";
import { useShellConfig, useDemoState } from "@/components/shell/ShellContext";
import AuthoringStageLayout from "./components/AuthoringStageLayout";
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
  const continueToContent = async () => { if (await view.draft.save()) router.push("/preview/assessments/new/content"); };
  return <AppShell><AuthoringStageLayout stage="purpose" eyebrow="Nueva evaluación · Vista previa local" title="Propósito de la evaluación" description="Guarda una base mínima y continúa cuando estés listo." backAction={<Link className={styles.secondaryLink} href="/preview/assessments">Volver a Evaluaciones</Link>} readOnlyNotice={isReadOnly ? <div className={styles.readonlyNotice} role="status">Solo lectura: puedes revisar el borrador, pero no modificarlo ni guardarlo.</div> : undefined} aside={<ReadinessSummary validation={view.draft.validation} />} footer={<><div className={styles.footerBack}><Button variant="outline" type="button" disabled={view.draft.saveState === "saving"} onClick={() => router.push("/preview/assessments")} startIcon={<LucideIcon name="arrow-left" size={16} />}>Volver a evaluaciones</Button></div><div className={styles.footerActions}><Button type="button" loading={view.draft.saveState === "saving"} disabled={!view.draft.validation.isReady || !view.draft.canEdit || isReadOnly} onClick={() => { void view.draft.save(); }} startIcon={<LucideIcon name="save" size={16} />}>{view.draft.saveState === "saved" ? "Guardar cambios" : "Guardar borrador"}</Button><Button type="button" variant="secondary" disabled={!view.draft.validation.isReady || !view.draft.canEdit || isReadOnly || view.draft.saveState === "saving"} onClick={continueToContent} endIcon={<LucideIcon name="arrow-right" size={16} />}>Continuar a contenidos</Button></div></>}><AssessmentPurposeSection values={view.draft.values} validation={view.draft.validation} validationRequested={view.draft.validationRequested} canEdit={view.draft.canEdit && !isReadOnly} saveState={view.draft.saveState} onChange={view.draft.update} onSave={() => { void view.draft.save(); }} onRetry={() => { void view.draft.save(); }} onCancel={() => router.push("/preview/assessments")} onContinue={continueToContent} showActions={false} /></AuthoringStageLayout></AppShell>;
}
