"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import AppShell from "@/components/shell/AppShell";
import Badge from "@/components/ds/Badge";
import Button from "@/components/ds/Button";
import LucideIcon from "@/components/ds/LucideIcon";
import Page from "@/components/shell/Page";
import PageHeader from "@/components/shell/PageHeader";
import PageSection from "@/components/shell/PageSection";
import { useShellConfig } from "@/components/shell/ShellContext";
import AssessmentEmptyState from "./components/AssessmentEmptyState";
import { useAssessmentAuthoringPage } from "./hooks/useAssessmentAuthoringPage";
import styles from "./AssessmentAuthoringPage.module.css";
import featureStyles from "./components/AssessmentAuthoring.module.css";
import type { AssessmentAccess } from "./domain/types";

export default function AssessmentListPage({ access = "editable" }: { access?: AssessmentAccess }) {
  useShellConfig({ title: "Evaluaciones", subtitle: "Crea y retoma tus instrumentos de evaluación" });
  const router = useRouter();
  const view = useAssessmentAuthoringPage(access);

  if (view.dataState.status === "loading") return <AppShell><Page><PageHeader eyebrow="Evaluaciones · Vista previa local" title="Tus evaluaciones" description="Un espacio para crear instrumentos reutilizables." /><div className={featureStyles.loadingState} aria-busy="true" aria-label="Cargando evaluaciones"><LucideIcon name="sparkles" size={28} /><p>Cargando tus evaluaciones locales…</p></div></Page></AppShell>;
  if (view.dataState.status === "error") return <AppShell><Page><PageHeader eyebrow="Evaluaciones · Vista previa local" title="Tus evaluaciones" description="Un espacio para crear instrumentos reutilizables." /><div className={featureStyles.errorState} role="alert"><LucideIcon name="alert-triangle" size={28} color="var(--danger-600)" /><h2>No pudimos cargar tus evaluaciones</h2><p>{view.dataState.message} Puedes reintentar sin conectar servicios externos.</p><Button onClick={view.retryLoad}>Reintentar</Button></div></Page></AppShell>;
  if (view.access === "permission-denied") return <AppShell><Page><PageHeader eyebrow="Evaluaciones · Vista previa local" title="Tus evaluaciones" description="Un espacio para crear instrumentos reutilizables." /><div className={featureStyles.permissionState} role="alert"><LucideIcon name="lock" size={28} /><h2>No tienes permisos para crear evaluaciones</h2><p>Puedes consultar el área, pero la creación pertenece a otro rol.</p><Link className={featureStyles.backLink} href="/preview">Volver al Inicio</Link></div></Page></AppShell>;
  return <AppShell><Page><PageHeader eyebrow="Evaluaciones · Vista previa local" title="Tus evaluaciones" description="Crea un instrumento y retómalo cuando quieras." actions={<><Button onClick={() => router.push("/preview/assessments/new/purpose")} startIcon={<LucideIcon name="plus" size={16} />}>Nueva evaluación</Button><Link className={featureStyles.secondaryLink} href="/preview">Volver al Inicio</Link></>} />{view.dataState.drafts.length === 0 ? <PageSection><AssessmentEmptyState /></PageSection> : <PageSection><div className={styles.draftHeader}><div><span className={featureStyles.kicker}>Borradores locales</span><h2>Continúa donde lo dejaste</h2><p>Este contenido está guardado solo en este navegador.</p></div><Badge tone="neutral">{view.dataState.drafts.length} borrador</Badge></div><div className={styles.draftCard}><div className={styles.draftIcon}><LucideIcon name="file-pen-line" size={24} /></div><div className={styles.draftDetails}><h3>{view.dataState.drafts[0].title || "Evaluación sin título"}</h3><p>{view.dataState.drafts[0].topic || "Sin temática todavía"}</p><Badge tone="warning">Borrador</Badge></div><Link className={styles.openDraft} href="/preview/assessments/new/purpose">Retomar borrador</Link></div><div className={styles.demoActions}><span>Datos demo/locales · no representa información real.</span><Button variant="ghost" size="sm" onClick={async () => { await view.resetDemoData(); window.location.reload(); }}>Restablecer datos demo</Button></div></PageSection>}</Page></AppShell>;
}
