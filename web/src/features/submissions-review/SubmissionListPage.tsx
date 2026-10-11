"use client";

import Link from "next/link";
import AppShell from "@/components/shell/AppShell";
import Page from "@/components/shell/Page";
import PageHeader from "@/components/shell/PageHeader";
import { Badge, Card } from "@/components/ds";
import { useShellConfig } from "@/components/shell/ShellContext";
import { SUBMISSIONS } from "./data";
import styles from "./SubmissionListPage.module.css";

export default function SubmissionListPage({ returnQuery }: { returnQuery: string }) {
  useShellConfig({ title: "Revisión de entregas", subtitle: "Bandeja de Operaciones" });
  return <AppShell><Page><PageHeader eyebrow="Operaciones · Revisar" title="Lista de entregas" description="Selecciona una entrega para abrir la revisión de entrega con sus preguntas y respuestas." />
    <Card><Card.Body><div className={styles.context}><strong>Evaluación API REST · Sección B</strong><span>Programación II · Segundo semestre 2026 · 12 entregas</span></div><div className={styles.list}>
      {SUBMISSIONS.map((submission) => <article className={styles.row} key={submission.id}><div className={styles.student}><strong>{submission.student}</strong><span>{submission.id}</span></div><div><Badge tone={submission.status.includes("Incompleta") ? "danger" : submission.status.includes("Incertidumbre") ? "warning" : "neutral"}>{submission.status}</Badge><small>{submission.answers} respuestas · {submission.files} archivo(s)</small></div><div className={styles.score}>{submission.level}</div><Link className={styles.review} href={`${submission.reviewHref}?${returnQuery.toString()}`}>Abrir revisión</Link></article>)}
    </div></Card.Body></Card>
  </Page></AppShell>;
}
