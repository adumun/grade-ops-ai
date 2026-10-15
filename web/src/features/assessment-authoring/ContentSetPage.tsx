"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AppShell from "@/components/shell/AppShell";
import Badge from "@/components/ds/Badge";
import Button from "@/components/ds/Button";
import LucideIcon from "@/components/ds/LucideIcon";
import Page from "@/components/shell/Page";
import PageHeader from "@/components/shell/PageHeader";
import PageNotFound from "@/components/shell/PageNotFound";
import { useDemoState, useShellConfig } from "@/components/shell/ShellContext";
import ContentSetSection from "./components/ContentSetSection";
import ContentSetCreateDialog from "./components/ContentSetCreateDialog";
import ContentSetLibrary from "./components/ContentSetLibrary";
import MaterialList from "./components/MaterialList";
import MaterialUploader from "./components/MaterialUploader";
import AuthoringStageLayout from "./components/AuthoringStageLayout";
import { useContentSetPage } from "./hooks/useContentSetPage";
import styles from "./components/ContentSet.module.css";
import featureStyles from "./components/AssessmentAuthoring.module.css";
import type { AssessmentAccess } from "./domain/types";

export default function ContentSetPage({ access = "editable", simulateSaveError = false }: { access?: AssessmentAccess; simulateSaveError?: boolean }) {
  useShellConfig({ title: "Nueva evaluación", subtitle: "Asocia contenidos reutilizables" });
  const { demoState } = useDemoState();
  const router = useRouter();
  const view = useContentSetPage(access, simulateSaveError);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const isReadOnly = access === "read-only" || demoState === "readonly";
  const canEdit = view.draft.canEdit && !isReadOnly;
  const canEditMaterials = canEdit && view.draft.mode === "new";

  if (view.dataState.status === "loading") return <AppShell><Page><PageHeader eyebrow="Nueva evaluación · Vista previa local" title="Contenidos de la evaluación" description="Cargando la biblioteca local…" /><div className={featureStyles.loadingState} aria-busy="true" aria-label="Cargando contenidos"><LucideIcon name="sparkles" size={28} /><p>Cargando…</p></div></Page></AppShell>;
  if (view.dataState.status === "error") return <AppShell><Page><PageHeader eyebrow="Nueva evaluación · Vista previa local" title="Contenidos de la evaluación" description="No se pudo cargar la biblioteca local." /><div className={featureStyles.errorState} role="alert"><LucideIcon name="alert-triangle" size={28} color="var(--danger-600)" /><h2>No pudimos cargar tus contenidos</h2><p>{view.dataState.message}</p><Button onClick={view.retryLoad}>Reintentar</Button></div></Page></AppShell>;
  if (access === "permission-denied" || demoState === "permission") return <AppShell><Page><PageHeader eyebrow="Nueva evaluación · Vista previa local" title="Contenidos de la evaluación" description="Revisa la asociación si tu rol tiene acceso." /><div className={featureStyles.permissionState} role="alert"><LucideIcon name="lock" size={28} /><h2>No tienes permisos para editar contenidos</h2><p>La biblioteca queda disponible en modo consulta para tu rol actual.</p><Link className={featureStyles.backLink} href="/preview/assessments/new/purpose">Volver al propósito</Link></div></Page></AppShell>;

  const continueToObjectives = async () => {
    if (await view.draft.save()) router.push("/preview/assessments/new/objectives");
  };

  return <AppShell><AuthoringStageLayout
    stage="content"
    eyebrow="Nueva evaluación · Vista previa local"
    title="Contenidos de la evaluación"
    description="Asocia recursos reutilizables o crea un conjunto nuevo para esta evaluación."
    backAction={<Link className={featureStyles.secondaryLink} href="/preview/assessments/new/purpose">Volver al propósito</Link>}
    readOnlyNotice={isReadOnly ? <div className={featureStyles.readonlyNotice} role="status">Solo lectura: puedes revisar la asociación, pero no modificarla ni guardarla.</div> : undefined}
    footer={<><div className={featureStyles.footerBack}><Button variant="outline" type="button" disabled={view.draft.saveState === "saving"} onClick={() => router.push("/preview/assessments/new/purpose")} startIcon={<LucideIcon name="arrow-left" size={16} />}>Volver al propósito</Button></div><div className={featureStyles.footerActions}><Button type="button" loading={view.draft.saveState === "saving"} disabled={!canEdit} onClick={() => { void view.draft.save(); }} startIcon={<LucideIcon name="save" size={16} />}>{view.draft.saveState === "saved" ? "Guardar cambios" : "Guardar asociación"}</Button><Button type="button" variant="secondary" disabled={!canEdit || view.draft.saveState === "saving"} onClick={continueToObjectives} endIcon={<LucideIcon name="arrow-right" size={16} />}>Continuar a objetivos</Button></div></>}
  >
    <div className={styles.contentLayout}>
      <ContentSetLibrary contentSets={view.draft.reusableContentSets} selectedIds={view.draft.selectedContentSetIds} mode={view.draft.mode} canEdit={canEdit} onSelect={view.draft.selectContentSet} onCreate={() => setCreateDialogOpen(true)} />
      <ContentSetSection values={view.draft.values} validation={view.draft.validation} validationRequested={view.draft.validationRequested} mode={view.draft.mode} canEdit={canEdit} saveState={view.draft.saveState} onChange={view.draft.update} onSave={() => { void view.draft.save(); }} onRetry={() => { void view.draft.save(); }} onCancel={() => router.push("/preview/assessments/new/purpose")} showActions={false} />
      <ContentSetCreateDialog
        open={createDialogOpen}
        canEdit={canEdit}
        onClose={() => setCreateDialogOpen(false)}
        onCreate={(values) => {
          view.draft.createNewContentSet(values);
          setCreateDialogOpen(false);
        }}
      />
      <MaterialUploader fixtures={view.draft.fixtures} disabled={!canEditMaterials || view.draft.saveState === "saving"} onAdd={view.draft.addMaterial} />
      <section className={styles.materialsSection} aria-labelledby="materials-title">
        <div className={styles.materialsHeader}><div><h2 id="materials-title">Materiales de los contenidos vinculados</h2><p>{view.draft.materials.length === 0 ? "Todavía no hay materiales asociados." : `${view.draft.materials.length} material${view.draft.materials.length === 1 ? "" : "es"} asociados.`}</p></div><Badge tone="neutral">{view.draft.mode === "existing" ? "Reutilizable · asociado" : "Nuevo · borrador"}</Badge></div>
        <MaterialList materials={view.draft.materials} disabled={!canEditMaterials || view.draft.saveState === "saving"} onRemove={view.draft.removeMaterial} onMove={view.draft.reorderMaterial} />
        <p className={styles.continueHint}>Estos materiales quedan disponibles para la etapa de objetivos y siguen perteneciendo a sus conjuntos reutilizables.</p>
      </section>
    </div>
  </AuthoringStageLayout></AppShell>;
}

export function ContentSetFutureRoute() {
  return <AppShell><Page><PageNotFound requestedPath="/preview/assessments/new/objectives" areaLabel="Objetivos" /></Page></AppShell>;
}
