"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useShellConfig } from "@/components/shell/ShellContext";
import Page from "@/components/shell/Page";
import PageHeader from "@/components/shell/PageHeader";
import { Badge, Button, Input, Textarea, LucideIcon } from "@/components/ds";
import { getAssessmentDraft } from "@/lib/api/assessments";
import {
  approveGradingReview,
  approveRubric,
  createRubric,
  exportApprovedResults,
  getLatestGradingReview,
  getSubmissionEvidence,
  listRubrics,
  listSubmissionBatches,
  runGrading,
  updateGradingReview,
  updateRubric,
  uploadSubmissions,
} from "@/lib/api/evaluation";
import type { AssessmentDraftDto } from "@/types/assessment";
import type {
  CreateRubricRequestDto,
  GradingProposalDto,
  GradingReviewDto,
  RubricCriterionDto,
  RubricViewDto,
  SubmissionBatchDto,
  SubmissionEvidenceDto,
} from "@/types/evaluation";
import styles from "./EvaluationWorkspacePage.module.css";

type Step = "rubric" | "upload" | "review";
type RubricForm = { title: string; totalPoints: string; criteria: RubricCriterionDto[] };

const STARTER_CRITERIA: RubricCriterionDto[] = [
  { id: "", name: "Funcionalidad y cumplimiento", description: "Resuelve los requerimientos funcionales de la evaluación y respeta las restricciones indicadas.", maxPoints: 35, evidenceExpectations: ["Flujo principal implementado", "Entradas y salidas esperadas"] },
  { id: "", name: "Correctitud y manejo de errores", description: "Considera casos límite, validaciones y respuestas ante entradas inválidas.", maxPoints: 30, evidenceExpectations: ["Validaciones observables", "Manejo de errores y casos límite"] },
  { id: "", name: "Calidad y estructura del código", description: "Mantiene una organización comprensible, separación razonable de responsabilidades y legibilidad.", maxPoints: 20, evidenceExpectations: ["Estructura del proyecto", "Nombres y responsabilidades claras"] },
  { id: "", name: "Pruebas y documentación", description: "Incluye evidencia de pruebas y documentación suficiente para comprender y verificar la solución.", maxPoints: 15, evidenceExpectations: ["Pruebas automatizadas o manuales documentadas", "Instrucciones de ejecución"] },
];

const EMPTY_FORM: RubricForm = { title: "Rúbrica de evaluación", totalPoints: "100", criteria: STARTER_CRITERIA };

function asRubricForm(rubric: RubricViewDto): RubricForm {
  return {
    title: rubric.title,
    totalPoints: String(rubric.totalPoints),
    criteria: rubric.criteria.map((criterion) => ({ ...criterion, evidenceExpectations: [...criterion.evidenceExpectations] })),
  };
}

function toRubricRequest(form: RubricForm): CreateRubricRequestDto {
  return {
    title: form.title,
    totalPoints: Number(form.totalPoints),
    criteria: form.criteria.map((criterion) => ({
      ...(criterion.id ? { id: criterion.id } : {}),
      name: criterion.name,
      description: criterion.description,
      maxPoints: Number(criterion.maxPoints),
      evidenceExpectations: criterion.evidenceExpectations.filter(Boolean),
    })),
  };
}

function money(value: number | null | undefined): string {
  return value == null ? "No disponible" : value.toLocaleString("es-CL", { maximumFractionDigits: 2 });
}

export default function EvaluationWorkspacePage({ assessmentId }: { assessmentId: string }) {
  useShellConfig({ title: "Revisión de código", subtitle: "De la rúbrica aprobada a la decisión docente" });

  const [assessment, setAssessment] = useState<AssessmentDraftDto | null>(null);
  const [rubrics, setRubrics] = useState<RubricViewDto[]>([]);
  const [activeRubric, setActiveRubric] = useState<RubricViewDto | null>(null);
  const [rubricForm, setRubricForm] = useState<RubricForm>(EMPTY_FORM);
  const [batches, setBatches] = useState<SubmissionBatchDto[]>([]);
  const [activeBatch, setActiveBatch] = useState<SubmissionBatchDto | null>(null);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [evidence, setEvidence] = useState<SubmissionEvidenceDto | null>(null);
  const [review, setReview] = useState<GradingReviewDto | null>(null);
  const [editedProposal, setEditedProposal] = useState<GradingProposalDto | null>(null);
  const [teacherComment, setTeacherComment] = useState("");
  const [activeStep, setActiveStep] = useState<Step>("rubric");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const approvedRubric = rubrics.find((rubric) => rubric.status === "APPROVED") ?? null;
  const criteriaPoints = useMemo(
    () => rubricForm.criteria.reduce((sum, criterion) => sum + (Number(criterion.maxPoints) || 0), 0),
    [rubricForm.criteria],
  );
  const finalScore = useMemo(
    () => editedProposal?.criteria.reduce((sum, criterion) => sum + (Number(criterion.suggestedPoints) || 0), 0) ?? 0,
    [editedProposal],
  );
  const selectedSubmission = activeBatch?.submissions.find((submission) => submission.id === selectedSubmissionId) ?? null;

  const loadSubmission = useCallback(async (submissionId: string) => {
    setSelectedSubmissionId(submissionId);
    setEvidence(null);
    setReview(null);
    setEditedProposal(null);
    setTeacherComment("");
    const [nextEvidence, nextReview] = await Promise.all([
      getSubmissionEvidence(submissionId),
      getLatestGradingReview(submissionId),
    ]);
    setEvidence(nextEvidence);
    setReview(nextReview);
    setEditedProposal(nextReview?.editedResult ?? null);
    setTeacherComment(nextReview?.teacherComment ?? "");
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [draft, nextRubrics, nextBatches] = await Promise.all([
          getAssessmentDraft(assessmentId),
          listRubrics(assessmentId),
          listSubmissionBatches(assessmentId),
        ]);
        if (cancelled) return;
        setAssessment(draft);
        setRubrics(nextRubrics);
        const currentRubric = nextRubrics[0] ?? null;
        setActiveRubric(currentRubric);
        if (currentRubric) setRubricForm(asRubricForm(currentRubric));
        setBatches(nextBatches);
        const latestBatch = nextBatches[0] ?? null;
        setActiveBatch(latestBatch);
        if (latestBatch?.submissions.length) {
          setActiveStep("review");
          const firstSubmission = latestBatch.submissions[0];
          setSelectedSubmissionId(firstSubmission.id);
          const [nextEvidence, nextReview] = await Promise.all([
            getSubmissionEvidence(firstSubmission.id),
            getLatestGradingReview(firstSubmission.id),
          ]);
          if (cancelled) return;
          setEvidence(nextEvidence);
          setReview(nextReview);
          setEditedProposal(nextReview?.editedResult ?? null);
          setTeacherComment(nextReview?.teacherComment ?? "");
        } else if (currentRubric?.status === "APPROVED") {
          setActiveStep("upload");
        } else {
          setActiveStep("rubric");
        }
      } catch (loadError) {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : "No pudimos cargar el espacio de evaluación.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [assessmentId, loadSubmission]);

  function updateCriterion(index: number, patch: Partial<RubricCriterionDto>) {
    setRubricForm((current) => ({
      ...current,
      criteria: current.criteria.map((criterion, criterionIndex) =>
        criterionIndex === index ? { ...criterion, ...patch } : criterion),
    }));
  }

  function addCriterion() {
    setRubricForm((current) => ({
      ...current,
      criteria: [...current.criteria, {
        id: "",
        name: "",
        description: "",
        maxPoints: 0,
        evidenceExpectations: [""],
      }],
    }));
  }

  function removeCriterion(index: number) {
    setRubricForm((current) => ({
      ...current,
      criteria: current.criteria.filter((_, criterionIndex) => criterionIndex !== index),
    }));
  }

  async function saveRubric() {
    setBusy(true); setError(""); setNotice("");
    try {
      const request = toRubricRequest(rubricForm);
      const saved = activeRubric?.status === "DRAFT"
        ? await updateRubric(assessmentId, activeRubric.id, request)
        : await createRubric(assessmentId, request);
      const nextRubrics = await listRubrics(assessmentId);
      setRubrics(nextRubrics);
      setActiveRubric(saved);
      setRubricForm(asRubricForm(saved));
      setNotice("Rúbrica guardada como borrador. Revísala antes de aprobarla.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No pudimos guardar la rúbrica.");
    } finally {
      setBusy(false);
    }
  }

  async function approveCurrentRubric() {
    if (!activeRubric) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const approved = await approveRubric(assessmentId, activeRubric.id);
      const nextRubrics = await listRubrics(assessmentId);
      setRubrics(nextRubrics);
      setActiveRubric(approved);
      setRubricForm(asRubricForm(approved));
      setActiveStep("upload");
      setNotice("Rúbrica aprobada. La evaluación ya está habilitada para recibir entregas.");
    } catch (approveError) {
      setError(approveError instanceof Error ? approveError.message : "No pudimos aprobar la rúbrica.");
    } finally {
      setBusy(false);
    }
  }

  async function uploadBatch() {
    if (!selectedFile) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const batch = await uploadSubmissions(assessmentId, selectedFile);
      const nextBatches = await listSubmissionBatches(assessmentId);
      setBatches(nextBatches);
      setActiveBatch(batch);
      setSelectedFile(null);
      if (batch.submissions.length) {
        await loadSubmission(batch.submissions[0].id);
        setActiveStep("review");
      }
      setNotice(`Recibimos ${batch.totalSubmissions} entregas y registramos ${batch.totalFiles} archivos.`);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "No pudimos procesar el ZIP.");
    } finally {
      setBusy(false);
    }
  }

  async function analyzeSubmission() {
    if (!selectedSubmissionId) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const nextReview = await runGrading(selectedSubmissionId);
      setReview(nextReview);
      setEditedProposal(nextReview.editedResult);
      setTeacherComment(nextReview.teacherComment ?? "");
      setNotice("La propuesta está lista. Revisa sus evidencias e incertidumbres antes de decidir.");
    } catch (gradingError) {
      setError(gradingError instanceof Error ? gradingError.message : "No pudimos generar la propuesta de revisión.");
    } finally {
      setBusy(false);
    }
  }

  async function saveTeacherReview() {
    if (!review || !editedProposal) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const saved = await updateGradingReview(review.gradingRunId, editedProposal, teacherComment);
      setReview(saved);
      setEditedProposal(saved.editedResult);
      setNotice("Tus ajustes quedaron guardados. La decisión final sigue pendiente.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No pudimos guardar los ajustes.");
    } finally {
      setBusy(false);
    }
  }

  async function approveTeacherReview() {
    if (!review || !editedProposal) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const saved = await updateGradingReview(review.gradingRunId, editedProposal, teacherComment);
      const approved = await approveGradingReview(saved.gradingRunId);
      setReview(approved);
      setEditedProposal(approved.editedResult);
      const refreshed = await listSubmissionBatches(assessmentId);
      setBatches(refreshed);
      setActiveBatch(refreshed.find((batch) => batch.id === activeBatch?.id) ?? activeBatch);
      setNotice("Resultado aprobado por el docente. No se ha publicado al estudiante.");
    } catch (approveError) {
      setError(approveError instanceof Error ? approveError.message : "No pudimos aprobar el resultado.");
    } finally {
      setBusy(false);
    }
  }

  async function downloadExport() {
    setBusy(true); setError("");
    try {
      const blob = await exportApprovedResults(assessmentId);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `gradeops-resultados-${assessmentId}.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setNotice("Exportación de resultados aprobados preparada.");
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : "No pudimos exportar los resultados.");
    } finally {
      setBusy(false);
    }
  }

  function updateSuggestion(index: number, patch: Partial<GradingProposalDto["criteria"][number]>) {
    setEditedProposal((current) => current ? ({
      ...current,
      criteria: current.criteria.map((criterion, criterionIndex) =>
        criterionIndex === index ? { ...criterion, ...patch } : criterion),
    }) : current);
  }

  if (loading) {
    return <Page><div className={styles.loading}><span className={styles.spinner} />Preparando tu espacio de revisión…</div></Page>;
  }

  if (!assessment) {
    return <Page><div className={styles.emptyPanel}><h2>Primero necesitamos una evaluación lista</h2><p>Genera o revisa el borrador de instrucciones antes de construir la rúbrica.</p><Link href={`/assessments/${assessmentId}/draft`}><Button>Ir al borrador</Button></Link></div></Page>;
  }

  return (
    <Page>
      <div className={styles.workspace}>
        <PageHeader
          eyebrow="GradeOps AI · evaluación de código"
          title={assessment.title}
          description="Prepara criterios, recibe proyectos y revisa propuestas con evidencia verificable."
          actions={<Link href={`/assessments/${assessmentId}/draft`} className={styles.textLink}>Ver instrucciones <LucideIcon name="chevron-right" size={15} /></Link>}
        />

        <section className={styles.introCard}>
          <div className={styles.introIcon}><LucideIcon name="sparkles" size={22} /></div>
          <div className={styles.introCopy}>
            <span>ASISTENCIA DOCENTE · DECISIÓN HUMANA</span>
            <h2>Menos tiempo buscando errores. Más tiempo enseñando.</h2>
            <p>GradeOps inspecciona evidencia del código, propone observaciones por criterio y deja la evaluación final en tus manos.</p>
          </div>
          <div className={styles.introStats}>
            <div><strong>{rubrics.length}</strong><span>versiones de rúbrica</span></div>
            <div><strong>{batches.reduce((sum, batch) => sum + batch.totalSubmissions, 0)}</strong><span>entregas recibidas</span></div>
          </div>
        </section>

        <nav className={styles.stepper} aria-label="Etapas de revisión">
          {([
            ["rubric", "01", "Definir rúbrica", "Criterios y puntajes"],
            ["upload", "02", "Recibir entregas", "ZIP de proyectos"],
            ["review", "03", "Revisar resultados", "Evidencia y aprobación"],
          ] as const).map(([key, number, label, description]) => (
            <button type="button" key={key} className={`${styles.step} ${activeStep === key ? styles.stepActive : ""} ${key === "upload" && !approvedRubric ? styles.stepLocked : ""}`} onClick={() => {
              if (key !== "rubric" && !approvedRubric) return;
              if (key === "review" && !activeBatch) return;
              setActiveStep(key);
            }}>
              <span className={styles.stepNumber}>{number}</span>
              <span><strong>{label}</strong><small>{description}</small></span>
              {key === "rubric" && approvedRubric && <LucideIcon name="check-circle" size={17} />}
              {key === "upload" && !approvedRubric && <LucideIcon name="lock" size={16} />}
            </button>
          ))}
        </nav>

        {error && <div className={styles.errorNotice} role="alert"><LucideIcon name="alert-triangle" size={18} />{error}</div>}
        {notice && <div className={styles.successNotice} role="status"><LucideIcon name="check-circle" size={18} />{notice}</div>}

        {activeStep === "rubric" && (
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div><span className={styles.kicker}>01 · Diseño de evaluación</span><h2>Una rúbrica clara mejora la revisión</h2><p>Define qué observar y qué evidencia demuestra cada criterio. Puedes ajustarla antes de aprobar.</p></div>
              {activeRubric && <Badge tone={activeRubric.status === "APPROVED" ? "success" : "warning"} dot>{activeRubric.status === "APPROVED" ? "Aprobada" : "Borrador"}</Badge>}
            </div>
            {activeRubric?.status === "APPROVED" && <div className={styles.lockedNotice}>Esta versión está aprobada y es inmutable. Crea una nueva versión si necesitas cambiarla.</div>}
            <div className={styles.rubricTopline}>
              <label className={styles.field}><span>Nombre de la rúbrica</span><Input value={rubricForm.title} disabled={activeRubric?.status === "APPROVED"} onChange={(event) => setRubricForm((current) => ({ ...current, title: event.target.value }))} /></label>
              <label className={styles.field}><span>Puntaje total</span><Input type="number" min="1" step="1" value={rubricForm.totalPoints} disabled={activeRubric?.status === "APPROVED"} onChange={(event) => setRubricForm((current) => ({ ...current, totalPoints: event.target.value }))} /></label>
              <div className={styles.pointsSummary}><span>Distribución</span><strong className={Math.abs(criteriaPoints - Number(rubricForm.totalPoints)) < 0.001 ? styles.pointsValid : styles.pointsInvalid}>{money(criteriaPoints)} / {money(Number(rubricForm.totalPoints))}</strong><small>{Math.abs(criteriaPoints - Number(rubricForm.totalPoints)) < 0.001 ? "Puntaje equilibrado" : "Ajusta los máximos para completar el total"}</small></div>
            </div>
            <div className={styles.criteriaList}>
              {rubricForm.criteria.map((criterion, index) => (
                <article className={styles.criterionCard} key={criterion.id || index}>
                  <div className={styles.criterionHeading}><span>CRITERIO {String(index + 1).padStart(2, "0")}</span>{activeRubric?.status !== "APPROVED" && <button type="button" onClick={() => removeCriterion(index)} aria-label={`Eliminar criterio ${index + 1}`}>Eliminar</button>}</div>
                  <div className={styles.criterionGrid}>
                    <label className={styles.field}><span>Nombre</span><Input value={criterion.name} disabled={activeRubric?.status === "APPROVED"} onChange={(event) => updateCriterion(index, { name: event.target.value })} /></label>
                    <label className={styles.field}><span>Puntaje máximo</span><Input type="number" min="0.1" step="0.5" value={criterion.maxPoints} disabled={activeRubric?.status === "APPROVED"} onChange={(event) => updateCriterion(index, { maxPoints: Number(event.target.value) })} /></label>
                    <label className={`${styles.field} ${styles.fullField}`}><span>Qué se espera observar</span><Textarea rows={2} value={criterion.description} disabled={activeRubric?.status === "APPROVED"} onChange={(event) => updateCriterion(index, { description: event.target.value })} /></label>
                    <label className={`${styles.field} ${styles.fullField}`}><span>Evidencias esperadas · una por línea</span><Textarea rows={2} value={criterion.evidenceExpectations.join("\n")} disabled={activeRubric?.status === "APPROVED"} onChange={(event) => updateCriterion(index, { evidenceExpectations: event.target.value.split("\n").map((value) => value.trim()).filter(Boolean) })} /></label>
                  </div>
                </article>
              ))}
            </div>
            {activeRubric?.status !== "APPROVED" && <div className={styles.rubricActions}><Button variant="outline" onClick={addCriterion}><LucideIcon name="plus" size={16} /> Añadir criterio</Button><div><Button variant="outline" onClick={() => { setActiveRubric(null); setRubricForm(EMPTY_FORM); }}>Usar plantilla base</Button><Button loading={busy} disabled={busy || Math.abs(criteriaPoints - Number(rubricForm.totalPoints)) >= 0.001 || rubricForm.criteria.length === 0} onClick={saveRubric}>Guardar borrador</Button>{activeRubric?.status === "DRAFT" && <Button loading={busy} disabled={busy} onClick={approveCurrentRubric}>Aprobar rúbrica</Button>}</div></div>}
            {activeRubric?.status === "APPROVED" && <div className={styles.rubricActions}><Button variant="outline" onClick={() => { setActiveRubric(null); setRubricForm(asRubricForm(activeRubric)); }}>Crear nueva versión editable</Button><Button onClick={() => setActiveStep("upload")}>Continuar a las entregas <LucideIcon name="arrow-right" size={16} /></Button></div>}
          </section>
        )}

        {activeStep === "upload" && (
          <section className={styles.panel}>
            <div className={styles.panelHeader}><div><span className={styles.kicker}>02 · Recepción segura</span><h2>Sube las entregas de tus estudiantes</h2><p>Un ZIP puede contener una carpeta por estudiante o un único proyecto. No ejecutamos el código.</p></div><Badge tone="success" dot>Rúbrica aprobada</Badge></div>
            <div className={styles.uploadZone}>
              <div className={styles.uploadIcon}><LucideIcon name="file-archive" size={26} /></div>
              <h3>Arrastra aquí el archivo ZIP</h3>
              <p>Inspeccionaremos la estructura, inventariaremos archivos y extraeremos solo evidencia textual compatible.</p>
              <label className={styles.filePicker}>Seleccionar ZIP<input type="file" accept=".zip,application/zip" onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)} /></label>
              {selectedFile && <div className={styles.selectedFile}><LucideIcon name="file-check" size={17} /><strong>{selectedFile.name}</strong><span>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span></div>}
              <Button loading={busy} disabled={busy || !selectedFile} onClick={uploadBatch}>Procesar entregas</Button>
              <small>Límite inicial: 25 MB comprimidos · 500 archivos · 100 MB descomprimidos</small>
            </div>
            {batches.length > 0 && <div className={styles.batchHistory}><h3>Recepciones anteriores</h3>{batches.map((batch) => <button type="button" key={batch.id} onClick={() => { setActiveBatch(batch); if (batch.submissions[0]) void loadSubmission(batch.submissions[0].id); setActiveStep("review"); }}><span><strong>{batch.originalFilename}</strong><small>{new Date(batch.createdAt).toLocaleString("es-CL")}</small></span><Badge tone="neutral">{batch.totalSubmissions} entregas</Badge></button>)}</div>}
          </section>
        )}

        {activeStep === "review" && (
          <section className={styles.reviewPanel}>
            <div className={styles.panelHeader}><div><span className={styles.kicker}>03 · Revisión docente</span><h2>Propuestas con evidencia, no cajas negras</h2><p>Selecciona una entrega, inspecciona el código y decide qué sugerencias conservar.</p></div><div className={styles.reviewActions}><Button variant="outline" disabled={busy || !activeBatch} onClick={downloadExport}><LucideIcon name="download" size={16} /> Exportar aprobadas</Button><Badge tone="info">{activeBatch?.totalSubmissions ?? 0} entregas</Badge></div></div>
            {!activeBatch ? <div className={styles.emptyState}><h3>Aún no hay entregas</h3><p>Aprueba una rúbrica y procesa un ZIP para comenzar.</p><Button onClick={() => setActiveStep(approvedRubric ? "upload" : "rubric")}>Continuar</Button></div> : (
              <div className={styles.reviewLayout}>
                <aside className={styles.submissionList}>
                  <div className={styles.submissionListHeading}><strong>Entregas recibidas</strong><small>{activeBatch.originalFilename}</small></div>
                  {activeBatch.submissions.map((submission) => <button type="button" key={submission.id} className={selectedSubmissionId === submission.id ? styles.submissionActive : ""} onClick={() => void loadSubmission(submission.id)}><span className={styles.submissionAvatar}>{submission.learnerLabel.slice(0, 1).toUpperCase()}</span><span className={styles.submissionMeta}><strong>{submission.learnerLabel}</strong><small>{submission.textFileCount} archivos de texto · {submission.fileCount} archivos</small></span><Badge tone={submission.status === "APPROVED" ? "success" : submission.status === "GRADED" ? "info" : "neutral"}>{submission.status === "APPROVED" ? "Aprobada" : submission.status === "GRADED" ? "En revisión" : "Pendiente"}</Badge></button>)}
                </aside>
                <div className={styles.reviewDetail}>
                  {selectedSubmission && <div className={styles.reviewSubject}><div><span>ENTREGA SELECCIONADA</span><h3>{selectedSubmission.learnerLabel}</h3><small>{selectedSubmission.sourceDirectory}</small></div>{!review && <Button loading={busy} disabled={busy || selectedSubmission.textFileCount === 0} onClick={analyzeSubmission}><LucideIcon name="sparkles" size={16} /> Analizar con IA</Button>}</div>}
                  {evidence && <div className={styles.evidenceFiles}><div className={styles.subsectionHeading}><strong>Archivos inspeccionables</strong><span>{evidence.files.length} archivos</span></div>{evidence.files.map((file) => <details className={styles.fileEvidence} key={file.path}><summary><span><LucideIcon name={file.classification === "TEXT" ? "file-code" : "file"} size={16} />{file.path}</span><Badge tone={file.classification === "TEXT" ? "success" : file.classification === "OVERSIZED" ? "warning" : "neutral"}>{file.classification}</Badge></summary>{file.extractedText ? <pre>{file.extractedText}</pre> : <p>Contenido no textual o fuera del límite de inspección. No se ejecutó.</p>}</details>)}</div>}
                  {review && editedProposal && <div className={styles.proposalPanel}>
                    <div className={styles.proposalHeader}><div><Badge tone={review.status === "APPROVED" ? "success" : "warning"} dot>{review.status === "APPROVED" ? "Aprobada por docente" : "Propuesta IA · pendiente"}</Badge><h3>Evaluación sugerida</h3><p>La propuesta no es una nota final hasta que la apruebes.</p></div><div className={styles.scoreCard}><strong>{money(finalScore)}</strong><span>de {money(editedProposal.criteria.reduce((sum, item) => sum + item.maxPoints, 0))} puntos</span></div></div>
                    <div className={styles.executionMeta}><span>Proveedor <strong>{review.execution.provider ?? "—"}</strong></span><span>Modelo <strong>{review.execution.model ?? "—"}</strong></span><span>Prompt <strong>{review.execution.promptVersion ?? "—"}</strong></span><span>Costo <strong>{money(review.execution.costEstimate)}</strong></span></div>
                    {editedProposal.criteria.map((criterion, index) => <article className={styles.suggestionCard} key={criterion.criterionId}><div className={styles.suggestionTitle}><div><span>CRITERIO {String(index + 1).padStart(2, "0")}</span><h4>{criterion.criterionName}</h4></div><div className={styles.scoreInput}><Input type="number" min="0" max={criterion.maxPoints} step="0.5" disabled={review.status === "APPROVED"} value={criterion.suggestedPoints} onChange={(event) => updateSuggestion(index, { suggestedPoints: Number(event.target.value) })} /><small>/ {money(criterion.maxPoints)}</small></div></div><p>{criterion.rationale}</p><label className={styles.field}><span>Comentario docente / justificación</span><Textarea rows={2} disabled={review.status === "APPROVED"} value={criterion.rationale} onChange={(event) => updateSuggestion(index, { rationale: event.target.value })} /></label><div className={styles.uncertaintyLine}><Badge tone={criterion.confidence === "HIGH" ? "success" : criterion.confidence === "MEDIUM" ? "info" : "warning"}>{criterion.confidence} confianza</Badge><span>{criterion.uncertainty}</span></div>{criterion.evidence.length > 0 && <div className={styles.citedEvidence}><strong>Evidencia citada</strong>{criterion.evidence.map((item, evidenceIndex) => <div key={evidenceIndex}><span>{item.filePath} · líneas {item.lineStart}–{item.lineEnd}</span><pre>{item.excerpt}</pre></div>)}</div>}</article>)}
                    <label className={styles.field}><span>Feedback general para el estudiante</span><Textarea rows={3} disabled={review.status === "APPROVED"} value={editedProposal.overallFeedback} onChange={(event) => setEditedProposal((current) => current ? { ...current, overallFeedback: event.target.value } : current)} /></label>
                    <label className={styles.field}><span>Incertidumbre general</span><Textarea rows={2} disabled={review.status === "APPROVED"} value={editedProposal.uncertaintySummary} onChange={(event) => setEditedProposal((current) => current ? { ...current, uncertaintySummary: event.target.value } : current)} /></label>
                    <label className={styles.field}><span>Observación privada del docente</span><Textarea rows={2} disabled={review.status === "APPROVED"} value={teacherComment} onChange={(event) => setTeacherComment(event.target.value)} placeholder="Notas internas que no se incluirán en el feedback al estudiante…" /></label>
                    {editedProposal.reviewFlags.length > 0 && <div className={styles.reviewFlags}><strong>Atención</strong>{editedProposal.reviewFlags.map((flag) => <span key={flag}>{flag}</span>)}</div>}
                    {review.status === "DRAFT" && <div className={styles.reviewFooter}><Button variant="outline" loading={busy} disabled={busy} onClick={saveTeacherReview}>Guardar ajustes</Button><Button loading={busy} disabled={busy} onClick={approveTeacherReview}><LucideIcon name="shield-check" size={16} /> Aprobar resultado</Button></div>}
                    {review.status === "APPROVED" && <div className={styles.approvedNotice}><LucideIcon name="check-circle" size={18} /><span>Aprobada por {review.approvedBy} · {review.approvedAt ? new Date(review.approvedAt).toLocaleString("es-CL") : ""}. La publicación al estudiante permanece separada.</span></div>}
                  </div>}
                  {review === null && selectedSubmission && <div className={styles.reviewEmpty}><LucideIcon name="sparkles" size={24} /><h3>Lista para revisar</h3><p>Analiza esta entrega con la rúbrica aprobada. GradeOps devolverá una propuesta por criterio, con referencias verificadas al código y sus incertidumbres.</p></div>}
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </Page>
  );
}
