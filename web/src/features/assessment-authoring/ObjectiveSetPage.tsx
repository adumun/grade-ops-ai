"use client";

import Link from "next/link";
import AppShell from "@/components/shell/AppShell";
import Button from "@/components/ds/Button";
import LucideIcon from "@/components/ds/LucideIcon";
import Page from "@/components/shell/Page";
import PageHeader from "@/components/shell/PageHeader";
import { useDemoState, useShellConfig } from "@/components/shell/ShellContext";
import AuthoringStageLayout from "./components/AuthoringStageLayout";
import ObjectiveBuilder from "./components/ObjectiveBuilder";
import ObjectiveCoverageSummary from "./components/ObjectiveCoverageSummary";
import ObjectiveList from "./components/ObjectiveList";
import featureStyles from "./components/AssessmentAuthoring.module.css";
import styles from "./components/Objectives.module.css";
import { useObjectivePage } from "./hooks/useObjectivePage";
import type { AssessmentAccess } from "./domain/types";

export default function ObjectiveSetPage({ access = "editable", simulateSaveError = false }: { access?: AssessmentAccess; simulateSaveError?: boolean }) {
  useShellConfig({ title: "Nueva evaluación", subtitle: "Objetivos medibles" });
  const { demoState } = useDemoState();
  const view = useObjectivePage(access, simulateSaveError);
  const isReadOnly = access === "read-only" || demoState === "readonly";
  const canEdit = view.objectiveSet.canEdit && !isReadOnly;
  if (view.dataState.status === "loading") return <AppShell><Page><PageHeader eyebrow="Nueva evaluación · Vista previa local" title="Objetivos medibles" description="Cargando los objetivos locales…" /><div className={featureStyles.loadingState} aria-busy="true" aria-label="Cargando objetivos"><LucideIcon name="sparkles" size={28} /><p>Cargando…</p></div></Page></AppShell>;
  if (view.dataState.status === "error") return <AppShell><Page><PageHeader eyebrow="Nueva evaluación · Vista previa local" title="Objetivos medibles" description="No se pudo cargar el conjunto de objetivos." /><div className={featureStyles.errorState} role="alert"><LucideIcon name="alert-triangle" size={28} color="var(--danger-600)" /><h2>No pudimos cargar tus objetivos</h2><p>{view.dataState.message}</p><Button onClick={view.retryLoad}>Reintentar</Button></div></Page></AppShell>;
  if (access === "permission-denied" || demoState === "permission") return <AppShell><Page><PageHeader eyebrow="Nueva evaluación · Vista previa local" title="Objetivos medibles" description="Revisa el conjunto si tu rol tiene acceso." /><div className={featureStyles.permissionState} role="alert"><LucideIcon name="lock" size={28} /><h2>No tienes permisos para editar objetivos</h2><p>Esta etapa queda disponible solo para consulta en tu rol actual.</p><Link className={featureStyles.backLink} href="/preview/assessments/new/content">Volver a contenidos</Link></div></Page></AppShell>;
  return <AppShell><AuthoringStageLayout stage="objectives" eyebrow="Nueva evaluación · Vista previa local" title="Objetivos medibles" description="Define qué debe demostrar el estudiante y la evidencia que lo hará observable." backAction={<Link className={featureStyles.secondaryLink} href="/preview/assessments/new/content">Volver a contenidos</Link>} readOnlyNotice={isReadOnly ? <div className={featureStyles.readonlyNotice} role="status">Solo lectura: puedes revisar los objetivos, pero no modificarlos ni guardarlos.</div> : undefined} aside={<ObjectiveCoverageSummary coverage={view.coverage} />} footer={<><Link className={featureStyles.secondaryLink} href="/preview/assessments/new/content">Volver al ContentSet</Link><Button loading={view.objectiveSet.saveState === "saving"} disabled={!canEdit} onClick={() => { void view.objectiveSet.save(); }} startIcon={<LucideIcon name="save" size={16} />}>{view.objectiveSet.saveState === "saved" ? "Guardar cambios" : "Guardar objetivos"}</Button><Link className={featureStyles.secondaryLink} href="/preview/assessments/new/rubric">Continuar a rúbrica</Link></>}><div className={styles.primaryColumn}><ObjectiveBuilder values={view.objectiveSet.values} materials={view.materials} validation={view.objectiveSet.validation} editing={Boolean(view.objectiveSet.editingId)} canEdit={canEdit} saveState={view.objectiveSet.saveState} onChange={view.objectiveSet.update} onToggleMaterial={view.objectiveSet.toggleMaterial} onSubmit={view.objectiveSet.commitObjective} onCancel={view.objectiveSet.cancelEdit} /><section className={styles.objectivesSection} aria-labelledby="objectives-title"><div className={styles.sectionHeading}><div><span className={styles.kicker}>ObjectiveSet local</span><h2 id="objectives-title">Objetivos definidos</h2><p>Los datos demo se guardan solo en este navegador y no representan un contrato backend.</p></div></div><ObjectiveList objectives={view.objectiveSet.objectives} materials={view.materials} disabled={!canEdit || view.objectiveSet.saveState === "saving"} onEdit={view.objectiveSet.startEdit} onRemove={view.objectiveSet.remove} onDecision={view.objectiveSet.decideProposal} /></section>{view.objectiveSet.saveState === "error" && <div className={styles.errorBanner} role="alert"><strong>No se pudo guardar el ObjectiveSet local.</strong><span>Conservamos tus cambios para que puedas reintentar.</span><Button size="sm" variant="outline" disabled={!canEdit} onClick={() => { void view.objectiveSet.save(); }}>Reintentar</Button></div>}{view.objectiveSet.saveState === "saved" && <div className={styles.successBanner} role="status">Objetivos guardados localmente. Puedes volver y retomarlos desde esta vista.</div>}</div></AuthoringStageLayout></AppShell>;
}
