export type DemoState = "ready" | "loading" | "empty" | "error" | "partial" | "readonly";
export type FeedbackState = "WITHOUT_FEEDBACK" | "AI_GENERATED" | "TEACHER_REVIEW_PENDING" | "APPROVED" | "PUBLISHED" | "REQUIRES_REEVALUATION";
export type FilterKey = "institution" | "period" | "course" | "section";

export const DEMO_STATES: Array<{ value: DemoState; label: string }> = [
  { value: "ready", label: "Datos demo" }, { value: "loading", label: "Carga" }, { value: "empty", label: "Vacío" },
  { value: "error", label: "Error global" }, { value: "partial", label: "Error parcial" }, { value: "readonly", label: "Solo lectura" },
];
export const FILTER_OPTIONS: Record<FilterKey, string[]> = {
  institution: ["Todas las instituciones", "Colegio Horizonte", "Instituto Técnico Central"],
  period: ["Todos los periodos", "Segundo semestre 2026"], course: ["Todos los cursos y asignaturas", "Programación II", "Ciencias Naturales"],
  section: ["Todas las secciones y grupos", "Sección B", "8° Básico A"],
};
export const PENDING_ITEMS = [
  { id: "submissions-today", priority: 1, priorityLabel: "Urgente", title: "Revisar 12 entregas", context: "Programación II · API REST · Segundo semestre 2026", reason: "Vence hoy · 2 entregas con error de procesamiento", status: "12 entregas listas · 2 requieren atención", action: "Revisar entregas", destination: "Operaciones / Revisión de API REST", icon: "clipboard-check" as const },
  { id: "rubric-approval", priority: 2, priorityLabel: "Próximo", title: "Confirmar rúbrica de evaluación", context: "Ciencias Naturales · Laboratorio: ecosistemas", reason: "Publicar en 2 días · falta aprobación docente", status: "Borrador generado por IA", action: "Revisar rúbrica", destination: "Clase 8° Básico A / Rúbrica", icon: "file-pen-line" as const },
  { id: "feedback-review", priority: 3, priorityLabel: "Solicitado", title: "Revisar feedback generado por IA", context: "Programación II · Entrega API REST · Sección B", reason: "4 propuestas esperan revisión docente", status: "Pendiente de revisión docente", action: "Completar feedback", destination: "Revisión / Feedback de API REST", icon: "sparkles" as const },
  { id: "incomplete", priority: 4, priorityLabel: "Pendiente", title: "Ver entregas incompletas", context: "Ciencias Naturales · Proyecto de investigación", reason: "4 estudiantes no han completado su entrega", status: "Seguimiento abierto", action: "Ver incompletas", destination: "Operaciones / Entregas incompletas", icon: "alert-triangle" as const },
  { id: "prepare", priority: 5, priorityLabel: "Preparación", title: "Preparar evaluación próxima", context: "Ciencias Naturales · Proyecto de investigación", reason: "Fecha por confirmar · objetivos aún sin vincular", status: "Preparación incompleta", action: "Preparar evaluación", destination: "Clase 8° Básico A / Evaluaciones", icon: "calendar-clock" as const },
  { id: "reevaluation", priority: 6, priorityLabel: "Pendiente", title: "Revisar solicitud de reevaluación", context: "Programación II · Entrega API REST", reason: "1 estudiante solicitó una nueva revisión", status: "Requiere reevaluación", action: "Revisar solicitud", destination: "Revisión / Solicitudes", icon: "eye" as const },
];
export const UPCOMING_ASSESSMENTS = [
  { id: "assessment-2", title: "Proyecto de investigación", className: "Ciencias Naturales · 8° Básico A", date: "30 sep 2026", state: "Borrador", tone: "warning" as const },
  { id: "assessment-3", title: "Entrega API REST", className: "Programación II · Sección B", date: "10 oct 2026", state: "Publicado", tone: "success" as const },
  { id: "assessment-4", title: "Laboratorio: ecosistemas", className: "Ciencias Naturales · 8° Básico A", date: "18 oct 2026", state: "Fecha por confirmar", tone: "neutral" as const },
];
export const FEEDBACK_TRACKING: Array<{ label: string; count: string; state: FeedbackState; tone: "neutral" | "info" | "warning" | "success" | "danger" }> = [
  { label: "Sin feedback", count: "2", state: "WITHOUT_FEEDBACK", tone: "neutral" }, { label: "Generado por IA", count: "4", state: "AI_GENERATED", tone: "info" },
  { label: "Pendiente de revisión docente", count: "4", state: "TEACHER_REVIEW_PENDING", tone: "warning" }, { label: "Aprobado", count: "8", state: "APPROVED", tone: "success" },
  { label: "Publicado al alumno", count: "16", state: "PUBLISHED", tone: "success" }, { label: "Requiere reevaluación", count: "1", state: "REQUIRES_REEVALUATION", tone: "danger" },
];
