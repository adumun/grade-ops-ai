export type OperationsQueue = "prepare" | "review" | "confirm" | "approve";
export type DemoInboxState = "ready" | "loading" | "empty" | "error" | "readonly" | "permission";
export type DueDateFilter = "all" | "overdue" | "today" | "upcoming";

export interface OperationDestination {
  label: string;
  href: string;
  context: string;
  permission: "read" | "operate" | "approve";
  returnPath: string;
  implemented: boolean;
}

export interface DemoOperation {
  id: string;
  queue: OperationsQueue;
  title: string;
  context: string;
  className: string;
  subject: string;
  status: string;
  dueDate: string;
  dueDateIso: string;
  reason: string;
  primaryAction: string;
  primaryDestination: OperationDestination;
  contextDestination: OperationDestination;
  originLabel: string;
  originPath: string;
  priority: "urgent" | "next" | "normal";
  access: "editable" | "read-only";
  actionMode?: "fails-once";
  icon: "calendar-clock" | "clipboard-check" | "file-pen-line" | "sparkles" | "alert-triangle";
}

export const QUEUES: Array<{ id: OperationsQueue; label: string; shortLabel: string; description: string }> = [
  { id: "prepare", label: "Preparar", shortLabel: "Preparar", description: "Deja listo el siguiente ciclo de evaluación." },
  { id: "review", label: "Revisar", shortLabel: "Revisar", description: "Inspecciona trabajo y resultados pendientes." },
  { id: "confirm", label: "Confirmar", shortLabel: "Confirmar", description: "Valida propuestas antes de continuar." },
  { id: "approve", label: "Aprobar", shortLabel: "Aprobar", description: "Mantén la decisión docente antes de publicar." },
];

export const OPERATIONS: DemoOperation[] = [
  {
    id: "prepare-api-assessment",
    queue: "prepare",
    title: "Preparar evaluación de API REST",
    context: "Programación II · Entrega API REST · Sección B",
    className: "Programación II",
    subject: "API REST",
    status: "Objetivos sin vincular",
    dueDate: "Vence en 2 días",
    dueDateIso: "2026-10-12",
    reason: "Completa el alcance antes de enviar la evaluación a revisión.",
    primaryAction: "Preparar evaluación",
    primaryDestination: { label: "Preparar evaluación", href: "/preview/operations/destinations/assessment-builder?operation=prepare-api-assessment", context: "Constructor y configuración de evaluación", permission: "operate", returnPath: "/preview/operations", implemented: false },
    contextDestination: { label: "Ver contexto", href: "/preview", context: "Clase Programación II / Evaluaciones", permission: "read", returnPath: "/preview/operations", implemented: true },
    originLabel: "Clase Programación II",
    originPath: "Clases / Programación II / Evaluaciones",
    priority: "urgent",
    access: "editable",
    icon: "calendar-clock",
  },
  {
    id: "prepare-ecosystems",
    queue: "prepare",
    title: "Definir fecha del laboratorio de ecosistemas",
    context: "Ciencias Naturales · Laboratorio: ecosistemas · 8° Básico A",
    className: "8° Básico A",
    subject: "Ciencias Naturales",
    status: "Fecha por confirmar",
    dueDate: "Vence el 18 oct",
    dueDateIso: "2026-10-18",
    reason: "La evaluación está preparada, pero necesita una fecha de aplicación.",
    primaryAction: "Definir fecha",
    primaryDestination: { label: "Definir fecha", href: "/preview/operations/destinations/date-config?operation=prepare-ecosystems", context: "Configuración de fecha de aplicación", permission: "operate", returnPath: "/preview/operations", implemented: false },
    contextDestination: { label: "Ver contexto", href: "/preview", context: "Clase 8° Básico A / Evaluaciones", permission: "read", returnPath: "/preview/operations", implemented: true },
    originLabel: "Laboratorio de ecosistemas",
    originPath: "Clase 8° Básico A / Evaluaciones",
    priority: "next",
    access: "editable",
    icon: "calendar-clock",
  },
  {
    id: "review-submissions",
    queue: "review",
    title: "Revisar 12 entregas de API REST",
    context: "Programación II · API REST · Sección B",
    className: "Programación II",
    subject: "API REST",
    status: "2 con error de procesamiento",
    dueDate: "Vence hoy",
    dueDateIso: "2026-10-10",
    reason: "10 entregas están listas y 2 requieren una revisión del procesamiento.",
    primaryAction: "Revisar entregas",
    primaryDestination: { label: "Revisar entregas", href: "/preview/operations/submissions?operation=review-submissions", context: "Lista de entregas de API REST", permission: "operate", returnPath: "/preview/operations", implemented: true },
    contextDestination: { label: "Ver contexto", href: "/preview", context: "Clase Programación II / Entrega API REST", permission: "read", returnPath: "/preview/operations", implemented: true },
    originLabel: "Entrega API REST",
    originPath: "Operaciones / Revisión de API REST",
    priority: "urgent",
    access: "editable",
    actionMode: "fails-once",
    icon: "clipboard-check",
  },
  {
    id: "review-incomplete",
    queue: "review",
    title: "Ver entregas incompletas",
    context: "Ciencias Naturales · Proyecto de investigación · 8° Básico A",
    className: "8° Básico A",
    subject: "Ciencias Naturales",
    status: "4 estudiantes pendientes",
    dueDate: "Vence mañana",
    dueDateIso: "2026-10-11",
    reason: "Identifica quién necesita apoyo antes del cierre de la actividad.",
    primaryAction: "Ver incompletas",
    primaryDestination: { label: "Ver incompletas", href: "/preview/operations/submissions?operation=review-incomplete&view=incomplete", context: "Seguimiento de entregas incompletas", permission: "read", returnPath: "/preview/operations", implemented: true },
    contextDestination: { label: "Ver contexto", href: "/preview", context: "Clase 8° Básico A / Proyecto de investigación", permission: "read", returnPath: "/preview/operations", implemented: true },
    originLabel: "Proyecto de investigación",
    originPath: "Operaciones / Entregas incompletas",
    priority: "next",
    access: "read-only",
    icon: "alert-triangle",
  },
  {
    id: "confirm-rubric",
    queue: "confirm",
    title: "Confirmar rúbrica de evaluación",
    context: "Ciencias Naturales · Laboratorio: ecosistemas · 8° Básico A",
    className: "8° Básico A",
    subject: "Ciencias Naturales",
    status: "Borrador generado por IA",
    dueDate: "Vence en 2 días",
    dueDateIso: "2026-10-12",
    reason: "La IA propuso cuatro criterios; confirma que representan tu intención pedagógica.",
    primaryAction: "Revisar rúbrica",
    primaryDestination: { label: "Revisar rúbrica", href: "/preview/operations/destinations/rubric-review?operation=confirm-rubric", context: "Revisión de rúbrica de ecosistemas", permission: "approve", returnPath: "/preview/operations", implemented: false },
    contextDestination: { label: "Ver contexto", href: "/preview", context: "Clase 8° Básico A / Rúbrica", permission: "read", returnPath: "/preview/operations", implemented: true },
    originLabel: "Rúbrica de ecosistemas",
    originPath: "Clase 8° Básico A / Rúbrica",
    priority: "next",
    access: "editable",
    icon: "file-pen-line",
  },
  {
    id: "confirm-feedback",
    queue: "confirm",
    title: "Confirmar feedback generado por IA",
    context: "Programación II · Entrega API REST · Sección B",
    className: "Programación II",
    subject: "API REST",
    status: "Pendiente de revisión docente",
    dueDate: "Vence hoy",
    dueDateIso: "2026-10-10",
    reason: "4 propuestas de feedback esperan tu revisión antes de mostrarse al estudiante.",
    primaryAction: "Completar feedback",
    primaryDestination: { label: "Completar feedback", href: "/preview/operations/destinations/feedback-review?operation=confirm-feedback", context: "Revisión de feedback generado por IA", permission: "operate", returnPath: "/preview/operations", implemented: false },
    contextDestination: { label: "Ver contexto", href: "/preview", context: "Clase Programación II / Feedback API REST", permission: "read", returnPath: "/preview/operations", implemented: true },
    originLabel: "Feedback de API REST",
    originPath: "Revisión / Feedback de API REST",
    priority: "urgent",
    access: "editable",
    icon: "sparkles",
  },
  {
    id: "approve-feedback",
    queue: "approve",
    title: "Aprobar feedback de recursividad",
    context: "Programación II · Recursividad · Sección B",
    className: "Programación II",
    subject: "Recursividad",
    status: "Editado por la docente",
    dueDate: "Vence hoy",
    dueDateIso: "2026-10-10",
    reason: "La propuesta fue editada y está lista para aprobarse antes de publicar.",
    primaryAction: "Aprobar feedback",
    primaryDestination: { label: "Aprobar feedback", href: "/preview/operations/destinations/feedback-approval?operation=approve-feedback", context: "Aprobación de feedback de recursividad", permission: "approve", returnPath: "/preview/operations", implemented: false },
    contextDestination: { label: "Ver contexto", href: "/preview", context: "Clase Programación II / Aprobaciones", permission: "read", returnPath: "/preview/operations", implemented: true },
    originLabel: "Feedback de recursividad",
    originPath: "Aprobaciones / Feedback de recursividad",
    priority: "urgent",
    access: "editable",
    actionMode: "fails-once",
    icon: "sparkles",
  },
  {
    id: "approve-report",
    queue: "approve",
    title: "Aprobar informe de progreso trimestral",
    context: "Ciencias Naturales · 8° Básico A",
    className: "8° Básico A",
    subject: "Ciencias Naturales",
    status: "Listo para aprobación",
    dueDate: "Vence el 14 oct",
    dueDateIso: "2026-10-14",
    reason: "El informe resume los resultados y las brechas detectadas en el curso.",
    primaryAction: "Revisar informe",
    primaryDestination: { label: "Revisar informe", href: "/preview/operations/destinations/report-detail?operation=approve-report", context: "Detalle del informe trimestral", permission: "approve", returnPath: "/preview/operations", implemented: false },
    contextDestination: { label: "Ver contexto", href: "/preview", context: "Clase 8° Básico A / Reportes", permission: "read", returnPath: "/preview/operations", implemented: true },
    originLabel: "Informe trimestral",
    originPath: "Reportes / Progreso trimestral",
    priority: "normal",
    access: "editable",
    icon: "clipboard-check",
  },
];

export const INBOX_STATES: Array<{ value: DemoInboxState; label: string }> = [
  { value: "ready", label: "Datos demo" },
  { value: "loading", label: "Carga" },
  { value: "empty", label: "Vacío global" },
  { value: "error", label: "Error de carga" },
  { value: "readonly", label: "Solo lectura" },
  { value: "permission", label: "Permisos insuficientes" },
];

export const CLASS_OPTIONS = ["Todas las clases", "Programación II", "8° Básico A"];
export const SUBJECT_OPTIONS = ["Todas las asignaturas", "API REST", "Ciencias Naturales", "Recursividad"];
export const STATUS_OPTIONS = ["Todos los estados", "Objetivos sin vincular", "Pendiente de revisión docente", "Borrador generado por IA", "Listo para aprobación"];
export const DATE_OPTIONS: Array<{ value: DueDateFilter; label: string }> = [
  { value: "all", label: "Todas las fechas" },
  { value: "overdue", label: "Vencidas" },
  { value: "today", label: "Vencen hoy" },
  { value: "upcoming", label: "Próximas" },
];
