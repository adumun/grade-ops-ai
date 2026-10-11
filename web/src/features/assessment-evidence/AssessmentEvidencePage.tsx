"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/shell/AppShell";
import Page from "@/components/shell/Page";
import { useDemoState, useShellConfig } from "@/components/shell/ShellContext";
import { Badge, Button, LucideIcon } from "@/components/ds";
import { getAssessment, type Capability } from "./data";
import { ReviewAnswer, ReviewDecision, ReviewFeedback, ReviewQuestion, ReviewRubric } from "./ReviewComponents";
import styles from "./AssessmentEvidencePage.module.css";

export default function AssessmentEvidencePage({ assessmentId }: { assessmentId: string }) {
  useShellConfig({ title: "Revisión de entrega", subtitle: "Evaluación de evidencia y decisión docente" });
  const { demoState } = useDemoState();
  const assessment = getAssessment(assessmentId);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [notice, setNotice] = useState("");
  const [localStatus, setLocalStatus] = useState(assessment.status);
  const [backHref, setBackHref] = useState("/preview/operations");
  useEffect(() => {
    setBackHref(buildBackHref());
  }, []);
  const readOnly = demoState === "readonly" || Boolean(assessment.readOnlyReason);
  const can = (capability: Capability) => demoState !== "permission" && assessment.capabilities.includes(capability) && !((capability === "publish") && !assessment.publishable);

  function runAction(action: "review" | "adjust" | "reevaluate" | "approve" | "publish") {
    if (!can(action)) return;
    setFailed(false); setLoading(true); setNotice("");
    window.setTimeout(() => {
      setLoading(false);
      if (assessment.actionFailure === "reevaluate" && action === "reevaluate") { setFailed(true); setNotice("No se pudo enviar la reevaluación. La evidencia sigue visible y puedes reintentar."); return; }
      const labels = { review: "Evidencia marcada como revisada.", adjust: "Ajuste docente registrado en modo demo.", reevaluate: "Solicitud de reevaluación enviada en modo demo.", approve: "Resultado aprobado en modo demo. Publicar sigue siendo una acción independiente.", publish: "Resultado publicado en modo demo." };
      setLocalStatus(labels[action]); setNotice(labels[action]);
    }, 350);
  }

  return <AppShell><Page><div className={styles.content}>
    <div className={styles.returnNotice} role="status"><span><strong>Contexto de Operaciones conservado.</strong> Cola, búsqueda y filtros volverán al regresar.</span><Link href={withReturnFlag(backHref)}>← Volver a Operaciones</Link></div>
    <header className={styles.header}><nav aria-label="Breadcrumb" className={styles.crumbs}><Link href={withReturnFlag(backHref)}>Operaciones</Link><span>/</span><span>Revisión de entrega</span></nav><div className={styles.heading}><div><span className={styles.eyebrow}>Evaluación · revisión de entrega</span><h1>{assessment.title}</h1><p>{assessment.student ?? assessment.submission}</p></div><Badge tone={assessment.statusTone} dot>{localStatus}</Badge></div><div className={styles.context}>{[["Evaluación", assessment.title], ["Alumno", assessment.student ?? "Curso completo"], ["Curso / asignatura", `${assessment.course} · ${assessment.subject}`], ["Sección", assessment.section], ["Periodo", assessment.period]].map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div></header>
    <section className={styles.card} aria-labelledby="lifecycle-title"><div className={styles.cardHeader}><div><span className={styles.kicker}>Estado por dimensión</span><h2 id="lifecycle-title">Lifecycle de la evaluación</h2></div><Badge tone="neutral">7 dimensiones independientes</Badge></div><div className={styles.lifecycle}>{assessment.lifecycle.map((step) => <div className={`${styles.step} ${styles[step.tone]}`} key={step.label}><strong>{step.label}</strong><span>{step.state}</span></div>)}</div></section>
    {demoState === "loading" && <section className={styles.card} aria-label="Cargando detalle" aria-busy="true"><div className={styles.body}><div className={styles.skeleton}><span /><span /><span /><span /></div></div></section>}
    {demoState === "error" && <div className={styles.error} role="alert"><LucideIcon name="alert-triangle" size={19} /><div><strong>No pudimos cargar una sección del detalle.</strong><p>El contexto y el lifecycle permanecen visibles. Reintenta la carga de evidencia.</p></div><Button size="sm" onClick={() => setNotice("Reintento completado: evidencia demo disponible.")}>Reintentar</Button></div>}
    {demoState !== "loading" && <div className={styles.layout}><main className={styles.workspace}>
      <section className={styles.card} aria-labelledby="evidence-title"><div className={styles.cardHeader}><div><span className={styles.kicker}>Trabajo revisable</span><h2 id="evidence-title">Propuesta IA y evidencia</h2></div><Badge tone="info">Sugerencia IA</Badge></div><div className={styles.body}>{assessment.proposal ? <><div className={styles.proposalLead}><p>{assessment.proposal.summary}</p><span className={styles.demoWarning}>La IA propone; no reemplaza la decisión docente.</span></div><ul className={styles.reasonList}>{assessment.proposal.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul><div className={styles.metadata}>{[["Analiza", assessment.proposal.analyzed], ["Incertidumbre", assessment.proposal.uncertainty], ["Confianza", assessment.proposal.confidence], ["Proveedor / modelo", assessment.proposal.provider], ["Generada", assessment.proposal.generatedAt], ["Ejecución", assessment.proposal.execution], ["Costo estimado", assessment.proposal.cost]].map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div><details className={styles.details}><summary>Ver evidencia y metadatos técnicos</summary><div className={styles.evidenceBox}>fragmento.demo: GET /students/:id → 200<br />criterio: validación de entrada · observado parcialmente<br />origen: {assessment.proposal.execution}</div></details></> : <div className={styles.empty}><strong>Sin evidencia suficiente</strong><span>Falta una entrega completa para construir una propuesta. El siguiente paso es completar la entrega.</span></div>}</div></section>
      <section className={`${styles.card} ${assessment.uncertainty?.level === "Alta" ? styles.uncertaintyHigh : ""}`} aria-labelledby="uncertainty-title"><div className={styles.cardHeader}><div><span className={styles.kicker}>Atención requerida</span><h2 id="uncertainty-title">Incertidumbres y limitaciones</h2></div>{assessment.uncertainty && <Badge tone={assessment.uncertainty.level === "Alta" ? "warning" : "neutral"}>{assessment.uncertainty.level}</Badge>}</div><div className={styles.body}>{assessment.uncertainty ? <><p>{assessment.uncertainty.detail}</p><ul className={styles.uncertaintyList}>{assessment.uncertainty.items.map((item) => <li key={item}>{item}</li>)}</ul></> : <div className={styles.empty}><strong>No hay incertidumbres abiertas en este fixture.</strong><span>La revisión docente dejó trazabilidad en el historial.</span></div>}</div></section>
      <section className={styles.card} aria-labelledby="response-title"><div className={styles.cardHeader}><div><span className={styles.kicker}>Respuesta o entrega</span><h2 id="response-title">Evidencia de origen</h2></div></div><div className={`${styles.body} ${styles.response}`}>{assessment.response ? <><strong>{assessment.response.student}</strong><blockquote>{assessment.response.excerpt}</blockquote><p>{assessment.response.note}</p></> : <div className={styles.empty}><strong>Sin entrega para revisar</strong><span>No se simula una conclusión mientras falte evidencia.</span></div>}</div></section>
      {assessment.questions && <section className={styles.card} aria-labelledby="questions-title"><div className={styles.cardHeader}><div><span className={styles.kicker}>Trabajo del alumno</span><h2 id="questions-title">Preguntas y respuestas</h2></div><Badge tone="neutral">{assessment.questions.length} preguntas</Badge></div><div className={styles.body}>{assessment.questions.map((question) => <ReviewQuestion key={question.id} question={question} />)}</div></section>}
      <section className={styles.card} aria-labelledby="submission-details-title"><div className={styles.cardHeader}><div><span className={styles.kicker}>Trazabilidad académica</span><h2 id="submission-details-title">Objetivos, archivos y criterio aplicado</h2></div></div><div className={styles.body}>{assessment.objectives?.map((objective) => <ReviewAnswer key={objective} label="Objetivo" value={objective} />)}{assessment.files?.map((file) => <ReviewAnswer key={file} label="Archivo entregado" value={file} state="Disponible en fixture demo" />)}{assessment.appliedCriterion && <ReviewAnswer label="Criterio aplicado" value={assessment.appliedCriterion} />}</div></section>
      {assessment.rubric && <section className={styles.card} aria-labelledby="rubric-title"><div className={styles.cardHeader}><div><span className={styles.kicker}>Evaluación</span><h2 id="rubric-title">Rúbrica</h2></div></div><div className={styles.body}><ReviewRubric criteria={assessment.rubric} /></div></section>}
    </main><aside className={styles.decision} aria-label="Decisión docente">
      {(demoState === "permission" || readOnly) && <div className={styles.permission} role="alert"><LucideIcon name="lock" size={19} /><div><strong>{demoState === "permission" ? "Permisos insuficientes" : "Solo lectura"}</strong><p>{assessment.readOnlyReason ?? "Puedes consultar la evidencia, pero este estado no permite mutaciones."}</p></div></div>}
      <section className={styles.card}><div className={styles.cardHeader}><div><span className={styles.kicker}>Decisión humana</span><h2>Qué puedes hacer</h2></div><Badge tone="neutral">No automática</Badge></div><div className={styles.body}><div className={styles.actions}><div className={styles.actionGroup}><span className={styles.actionGroupTitle}>Inspeccionar</span><Button variant="outline" disabled={loading || !can("review")} loading={loading} onClick={() => runAction("review")}>Revisar evidencia</Button><Button variant="outline" disabled={loading || !can("adjust")} onClick={() => runAction("adjust")}>Ajustar propuesta</Button><Button variant="outline" disabled={loading || !can("adjust")} onClick={() => setNotice("Comentario guardado en modo demo; no se persiste en backend.")}>Guardar comentario</Button></div><div className={styles.actionGroup}><span className={styles.actionGroupTitle}>Resolver</span><Button variant="outline" disabled={loading || !can("reevaluate")} onClick={() => runAction("reevaluate")}>Solicitar reevaluación</Button><Button disabled={loading || !can("approve")} onClick={() => runAction("approve")}>Aprobar resultado</Button><Button variant="outline" disabled={loading || !can("publish")} onClick={() => runAction("publish")}>Publicar resultado</Button></div></div><p className={styles.consequence}>Aprobar confirma que el resultado puede avanzar. Publicar lo hace disponible para el alumno y solo aparece habilitado cuando el fixture ya está aprobado.</p></div></section>
      {assessment.proposal && <section className={styles.card} aria-labelledby="feedback-title"><div className={styles.cardHeader}><div><span className={styles.kicker}>Feedback</span><h2 id="feedback-title">Sugerencia IA</h2></div></div><div className={styles.body}><ReviewFeedback suggestion={assessment.proposal.summary} uncertainty={assessment.proposal.uncertainty} /></div></section>}
      <section className={styles.card} aria-labelledby="decision-detail-title"><div className={styles.cardHeader}><div><span className={styles.kicker}>Decisión docente</span><h2 id="decision-detail-title">Puntuación y comentario</h2></div></div><div className={styles.body}><ReviewDecision score={assessment.score ?? "Pendiente"} comment={assessment.teacherComment ?? ""} /></div></section>
      {failed && <div className={styles.error} role="alert"><span>{notice}</span><Button size="sm" variant="outline" onClick={() => runAction("reevaluate")}>Reintentar</Button></div>}{notice && !failed && <div role="status" className={styles.actionNotice} aria-live="polite">{notice}</div>}
      <section className={styles.card}><div className={styles.cardHeader}><div><span className={styles.kicker}>Trazabilidad</span><h2>Historial docente</h2></div></div><div className={`${styles.body} ${styles.history}`}>{assessment.history.length ? assessment.history.map((item) => <div className={styles.historyItem} key={`${item.actor}-${item.date}`}><strong>{item.action}</strong><span>{item.actor} · {item.date}</span><small>{item.detail}</small></div>) : <span className={styles.empty}>Aún no hay decisiones humanas registradas.</span>}</div></section>
    </aside></div>}
  </div></Page></AppShell>;
}

function buildBackHref() {
  if (typeof window === "undefined") return "/preview/operations";
  const source = new URLSearchParams(window.location.search); const params = new URLSearchParams();
  ["queue", "search", "className", "subject", "status", "date"].forEach((key) => { const value = source.get(key); if (value) params.set(key, value); });
  const query = params.toString(); return query ? `/preview/operations?${query}` : "/preview/operations";
}

function withReturnFlag(href: string) {
  return href.includes("?") ? `${href}&returned=1` : `${href}?returned=1`;
}
