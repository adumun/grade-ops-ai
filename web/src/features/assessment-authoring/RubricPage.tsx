"use client";

import Link from "next/link";
import AppShell from "@/components/shell/AppShell";
import Page from "@/components/shell/Page";
import PageHeader from "@/components/shell/PageHeader";
import Button from "@/components/ds/Button";
import LucideIcon from "@/components/ds/LucideIcon";
import { useDemoState, useShellConfig } from "@/components/shell/ShellContext";
import type { AssessmentAccess } from "./domain/types";
import AuthoringStageLayout from "./components/AuthoringStageLayout";
import RubricAiProposal from "./components/RubricAiProposal";
import RubricBaseSelector from "./components/RubricBaseSelector";
import RubricCoverageSummary from "./components/RubricCoverageSummary";
import RubricEditor from "./components/RubricEditor";
import featureStyles from "./components/AssessmentAuthoring.module.css";
import styles from "./components/Rubric.module.css";
import { useRubricPage } from "./hooks/useRubricPage";

export default function RubricPage({ access = "editable", simulateError = false, simulateSaveError = false }: { access?: AssessmentAccess; simulateError?: boolean; simulateSaveError?: boolean }) {
  useShellConfig({ title: "Nueva evaluación", subtitle: "Rúbrica reutilizable" });
  const { demoState } = useDemoState();
  const view = useRubricPage(access, simulateError, simulateSaveError);
  const readOnly = access === "read-only" || demoState === "readonly";
  const permissionDenied = access === "permission-denied" || demoState === "permission";
  const loading = demoState === "loading" || view.dataState.status === "loading";
  const failed = demoState === "error" || view.dataState.status === "error";
  if (loading) return <AppShell><Page><PageHeader eyebrow="Nueva evaluación · Vista previa local" title="Rúbrica reutilizable" description="Cargando la rúbrica local…" /><div className={featureStyles.loadingState} aria-busy="true" aria-label="Cargando rúbrica"><LucideIcon name="sparkles" size={28} /><p>Cargando…</p></div></Page></AppShell>;
  if (failed) return <AppShell><Page><PageHeader eyebrow="Nueva evaluación · Vista previa local" title="Rúbrica reutilizable" description="No se pudo cargar la rúbrica." /><div className={featureStyles.errorState} role="alert"><LucideIcon name="alert-triangle" size={28} color="var(--danger-600)" /><h2>No pudimos cargar tu rúbrica</h2><p>{view.dataState.status === "error" ? view.dataState.message : "El estado demo simula un error recuperable."}</p><Button onClick={view.retryLoad}>Reintentar</Button></div></Page></AppShell>;
  if (permissionDenied) return <AppShell><Page><PageHeader eyebrow="Nueva evaluación · Vista previa local" title="Rúbrica reutilizable" description="Revisa la rúbrica si tu rol tiene acceso." /><div className={featureStyles.permissionState} role="alert"><LucideIcon name="lock" size={28} /><h2>No tienes permisos para editar rúbricas</h2><p>Esta etapa queda disponible solo para consulta en tu rol actual.</p><Link className={featureStyles.backLink} href="/preview/assessments/new/objectives">Volver a Objetivos</Link></div></Page></AppShell>;
  const available = view.dataState.status === "ready" ? view.dataState.availableRubrics : [];
  const empty = demoState === "empty";
  return <AppShell><AuthoringStageLayout stage="rubric" eyebrow="Nueva evaluación · Vista previa local" title="Rúbrica reutilizable" description="Define criterios, niveles, puntajes, pesos y su vínculo con objetivos." backAction={<Link className={featureStyles.secondaryLink} href="/preview/assessments/new/objectives">Volver a Objetivos</Link>} readOnlyNotice={readOnly ? <div className={featureStyles.readonlyNotice} role="status">Solo lectura: puedes revisar la rúbrica, pero no modificarla ni guardarla.</div> : undefined} aside={<RubricCoverageSummary readiness={view.readiness} />} footer={<><Link className={featureStyles.secondaryLink} href="/preview/assessments/new/objectives">Volver a Objetivos</Link><Button loading={view.draft.saveState === "saving"} disabled={!view.draft.canEdit} onClick={() => { void view.draft.save(); }}>{view.draft.saveState === "saved" ? "Guardar cambios" : "Guardar rúbrica"}</Button><Link className={featureStyles.secondaryLink} href="/preview/assessments/new/questions">Continuar a Preguntas</Link></>}><div className={styles.primary}><RubricBaseSelector rubric={view.draft.rubric} availableRubrics={available} disabled={!view.draft.canEdit} onCreate={view.draft.createNew} onSelect={(id) => { const selected = available.find((rubric) => rubric.id === id); if (selected) view.draft.selectBase(selected); }} onDuplicate={view.draft.duplicate} /><RubricAiProposal decision={view.draft.rubric.aiDecision} disabled={!view.draft.canEdit} onDecision={view.draft.decideProposal} /><RubricEditor criteria={empty ? [] : view.draft.rubric.criteria} objectives={view.objectives} disabled={!view.draft.canEdit} onAdd={view.draft.addCriterion} onChange={view.draft.updateCriterion} onToggleObjective={view.draft.toggleObjective} onAddLevel={view.draft.addLevel} onUpdateLevel={view.draft.updateLevel} onRemoveLevel={view.draft.removeLevel} onMove={view.draft.moveCriterion} onRemove={view.draft.removeCriterion} />{view.draft.saveState === "error" && <div className={styles.errorBanner} role="alert">No se pudo guardar la rúbrica local. Conservamos tus cambios.<Button size="sm" variant="outline" onClick={() => { void view.draft.save(); }}>Reintentar</Button></div>}{view.draft.saveState === "saved" && <div className={styles.successBanner} role="status">Rúbrica guardada localmente. No representa datos de backend.</div>}</div></AuthoringStageLayout></AppShell>;
}
