export type SubmissionAnswerState = "correcta" | "incompleta" | "incierta";

export interface SubmissionRow {
  id: string;
  student: string;
  status: string;
  level: string;
  answers: number;
  files: number;
  reviewHref: string;
}

export const SUBMISSIONS: SubmissionRow[] = [
  { id: "submission-08", student: "Camila Soto", status: "Revisión pendiente", level: "En revisión", answers: 3, files: 1, reviewHref: "/preview/operations/assessment/api-rest-section-b" },
  { id: "submission-09", student: "Diego Muñoz", status: "Incompleta", level: "Sin nivel", answers: 1, files: 0, reviewHref: "/preview/operations/assessment/ecosystems-research" },
  { id: "submission-10", student: "Amaya Rojas", status: "Incertidumbre alta", level: "En revisión", answers: 2, files: 1, reviewHref: "/preview/operations/assessment/api-rest-feedback" },
  { id: "submission-11", student: "Tomás Pérez", status: "Solo lectura", level: "Logro alto", answers: 3, files: 1, reviewHref: "/preview/operations/assessment/published" },
];
