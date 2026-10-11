export type LifecycleTone = "neutral" | "info" | "success" | "warning" | "danger";
export type Capability = "read" | "review" | "adjust" | "reevaluate" | "approve" | "publish";

export interface LifecycleStep { label: string; state: string; tone: string; }
export interface ReviewQuestion { id: string; type: "Selección múltiple" | "Verdadero / falso" | "Respuesta abierta"; prompt: string; answer: string; answerState: "correcta" | "incompleta" | "incierta"; }
export interface RubricCriterion { name: string; level: string; score: string; evidence: string; }
export interface EvidenceAssessment {
  id: string;
  title: string;
  course: string;
  subject: string;
  section: string;
  period: string;
  submission: string;
  status: string;
  statusTone: LifecycleTone;
  lifecycle: LifecycleStep[];
  proposal: { summary: string; analyzed: string; reasons: string[]; uncertainty: string; confidence: string; provider: string; generatedAt: string; execution: string; cost: string } | null;
  uncertainty: { level: string; detail: string; items: string[] } | null;
  response: { student: string; excerpt: string; note: string } | null;
  capabilities: Capability[];
  readOnlyReason?: string;
  history: Array<{ actor: string; action: string; date: string; detail: string }>;
  publishable: boolean;
  actionFailure?: "reevaluate";
  student?: string;
  questions?: ReviewQuestion[];
  files?: string[];
  objectives?: string[];
  rubric?: RubricCriterion[];
  appliedCriterion?: string;
  teacherComment?: string;
  score?: string;
}

const BASE_LIFECYCLE: LifecycleStep[] = [
  { label: "Preparación", state: "Lista", tone: "success" },
  { label: "Entrega", state: "Recibida", tone: "success" },
  { label: "Corrección", state: "Procesada", tone: "success" },
  { label: "Revisión docente", state: "Pendiente", tone: "warning" },
  { label: "Feedback IA", state: "Generado", tone: "info" },
  { label: "Aprobación", state: "Pendiente", tone: "warning" },
  { label: "Publicación", state: "Bloqueada", tone: "neutral" },
];
const lifecycleWith = (transform: (step: LifecycleStep) => LifecycleStep) => BASE_LIFECYCLE.map(transform);

const PROPOSAL = { summary: "La respuesta cumple 3 de 4 criterios de la rúbrica.", analyzed: "Entrega de API REST · endpoint GET /students", reasons: ["Expone el endpoint solicitado y devuelve una respuesta JSON válida.", "La validación de entrada está presente, pero no cubre el caso de identificador vacío."], uncertainty: "Media: la evidencia no permite confirmar el comportamiento ante errores de red.", confidence: "78% (dato demostrativo)", provider: "Proveedor demo · Gemini (simulado)", generatedAt: "10 oct 2026 · 09:42", execution: "run-demo-api-rest-0042", cost: "USD 0,003 estimado" };

export const ASSESSMENTS: Record<string, EvidenceAssessment> = {
  "api-rest-section-b": { id: "api-rest-section-b", title: "Entrega API REST · revisión de evidencia", course: "Programación II", subject: "API REST", section: "Sección B", period: "Segundo semestre 2026", submission: "Entrega 08 · recibida 10 oct 2026", student: "Camila Soto", status: "Propuesta IA pendiente de revisión", statusTone: "info", lifecycle: BASE_LIFECYCLE, proposal: PROPOSAL, uncertainty: { level: "Media", detail: "La propuesta es útil como punto de partida, pero requiere verificar el manejo de errores.", items: ["No hay evidencia de una prueba de timeout.", "El fragmento revisado no incluye el contrato completo de errores."] }, response: { student: "Camila Soto · Entrega 08", excerpt: "GET /students/:id devuelve 200 con el recurso solicitado.", note: "La evidencia se limita al fragmento entregado en esta maqueta." }, questions: [{ id: "q1", type: "Selección múltiple", prompt: "¿Qué respuesta debe devolver el endpoint ante un ID válido?", answer: "200 OK con el recurso solicitado.", answerState: "correcta" }, { id: "q2", type: "Verdadero / falso", prompt: "La validación de entrada cubre un identificador vacío.", answer: "Verdadero, sin evidencia de prueba.", answerState: "incierta" }, { id: "q3", type: "Respuesta abierta", prompt: "Describe cómo manejarías un timeout del servicio.", answer: "El endpoint devuelve el recurso, pero no explica el timeout.", answerState: "incompleta" }], files: ["api-rest-entrega-08.zip", "captura-endpoint.png"], objectives: ["Implementar un endpoint REST con respuesta JSON válida.", "Validar entradas y documentar errores."], rubric: [{ name: "Contrato REST", level: "Logrado", score: "3 / 3", evidence: "Endpoint GET responde JSON válido." }, { name: "Validación y errores", level: "En desarrollo", score: "2 / 3", evidence: "Falta evidencia de timeout." }], appliedCriterion: "Validación de entradas y manejo de errores", teacherComment: "", score: "5 / 6", capabilities: ["read", "review", "adjust", "reevaluate", "approve"], history: [{ actor: "Sistema demo", action: "Generó propuesta IA", date: "10 oct 2026 · 09:42", detail: "Ejecución run-demo-api-rest-0042" }], publishable: false },
  "ecosystems-research": { id: "ecosystems-research", title: "Proyecto de investigación · entrega incompleta", course: "8° Básico A", subject: "Ciencias Naturales", section: "Sección A", period: "Segundo semestre 2026", submission: "Entrega 09 · falta respuesta final", student: "Diego Muñoz", status: "Entrega incompleta", statusTone: "danger", lifecycle: lifecycleWith((step) => step.label === "Entrega" ? { ...step, state: "Incompleta", tone: "danger" } : step), proposal: null, uncertainty: { level: "Alta", detail: "No es posible proponer una conclusión mientras falte una respuesta.", items: ["Falta la explicación del impacto humano.", "La corrección determinista todavía no puede cerrarse."] }, response: null, questions: [{ id: "q1", type: "Respuesta abierta", prompt: "Explica un impacto humano en el ecosistema.", answer: "", answerState: "incompleta" }], files: [], objectives: ["Relacionar cambios del ecosistema con acciones humanas."], rubric: [{ name: "Explicación causal", level: "Sin evidencia", score: "0 / 3", evidence: "Respuesta pendiente." }], appliedCriterion: "Relación entre causa y consecuencia", teacherComment: "", score: "Sin puntuar", capabilities: ["read", "review"], readOnlyReason: "Este caso muestra evidencia parcial; no puedes aprobar ni publicar una evaluación incompleta.", history: [], publishable: false },
  "api-rest-feedback": { id: "api-rest-feedback", title: "Feedback de API REST · propuesta IA", course: "Programación II", subject: "API REST", section: "Sección B", period: "Segundo semestre 2026", submission: "Entrega 08 · respuesta revisada", status: "Incertidumbre alta", statusTone: "warning", lifecycle: lifecycleWith((step) => step.label === "Feedback IA" ? { ...step, state: "Con incertidumbre", tone: "warning" } : step), proposal: { ...PROPOSAL, summary: "La IA sugiere pedir una prueba adicional de errores de red.", uncertainty: "Alta: faltan evidencias para asegurar que el feedback sea específico.", confidence: "54% (dato demostrativo)" }, uncertainty: { level: "Alta", detail: "La recomendación podría ser demasiado general para esta entrega.", items: ["Solo se observó una ejecución exitosa.", "La respuesta no incluye trazas de error."] }, response: { student: "Entrega 08 · estudiante demo", excerpt: "Mi endpoint funciona cuando envío un ID válido.", note: "Se requiere validar si el feedback orienta un siguiente paso concreto." }, capabilities: ["read", "review", "adjust", "reevaluate", "approve"], history: [{ actor: "Docente demo", action: "Solicitó revisión adicional", date: "10 oct 2026 · 10:05", detail: "La incertidumbre requiere atención." }], publishable: false, actionFailure: "reevaluate" },
  "recursivity-feedback": { id: "recursivity-feedback", title: "Feedback de recursividad · decisión ajustada", course: "Programación II", subject: "Recursividad", section: "Sección B", period: "Segundo semestre 2026", submission: "Entrega 05 · feedback editado", status: "Ajustado por la docente", statusTone: "success", lifecycle: lifecycleWith((step) => step.label === "Revisión docente" ? { ...step, state: "Ajustada", tone: "success" } : step), proposal: { ...PROPOSAL, summary: "La IA propuso una explicación; la docente la ajustó para incluir un ejemplo.", uncertainty: "Baja: la evidencia coincide con el criterio revisado.", confidence: "91% (dato demostrativo)" }, uncertainty: { level: "Baja", detail: "La revisión docente documentó el ajuste realizado.", items: ["El ejemplo añadido no ha sido publicado todavía."] }, response: { student: "Entrega 05 · estudiante demo", excerpt: "La función divide el problema hasta llegar al caso base.", note: "La docente agregó un ejemplo de caso base." }, capabilities: ["read", "review", "adjust", "approve"], history: [{ actor: "Docente demo", action: "Ajustó propuesta IA", date: "9 oct 2026 · 16:20", detail: "Agregó ejemplo de caso base." }], publishable: false },
  "quarterly-progress-report": { id: "quarterly-progress-report", title: "Informe de progreso trimestral", course: "8° Básico A", subject: "Ciencias Naturales", section: "Sección A", period: "Segundo semestre 2026", submission: "Resumen de 28 estudiantes", status: "Aprobado · listo para publicar", statusTone: "success", lifecycle: BASE_LIFECYCLE.map((step) => step.label === "Revisión docente" || step.label === "Aprobación" ? { ...step, state: step.label === "Aprobación" ? "Aprobada" : "Completada", tone: "success" } : step).map((step) => step.label === "Publicación" ? { ...step, state: "Lista para publicar", tone: "info" } : step), proposal: { ...PROPOSAL, summary: "El informe sintetiza avances y brechas del curso.", uncertainty: "Baja: el resumen fue revisado por la docente.", confidence: "94% (dato demostrativo)" }, uncertainty: null, response: { student: "Curso completo", excerpt: "El grupo avanzó en identificación de ecosistemas.", note: "El informe está aprobado, pero aún no está disponible para estudiantes." }, capabilities: ["read", "review", "publish"], history: [{ actor: "Docente demo", action: "Aprobó informe", date: "10 oct 2026 · 11:10", detail: "Listo para publicación independiente." }], publishable: true },
  published: { id: "published", title: "Evaluación de ecosistemas · resultados publicados", course: "8° Básico A", subject: "Ciencias Naturales", section: "Sección A", period: "Segundo semestre 2026", submission: "28 resultados publicados", status: "Publicado", statusTone: "success", lifecycle: BASE_LIFECYCLE.map((step) => step.label === "Revisión docente" || step.label === "Aprobación" || step.label === "Publicación" ? { ...step, state: "Completada", tone: "success" } : step), proposal: { ...PROPOSAL, summary: "La propuesta fue aprobada y publicada en modo demo.", uncertainty: "Baja: resultado ya revisado.", confidence: "96% (dato demostrativo)" }, uncertainty: null, response: { student: "Curso completo", excerpt: "Resultados disponibles mediante enlace seguro demo.", note: "La publicación es solo visual y no persiste cambios." }, capabilities: ["read", "review"], readOnlyReason: "Esta evaluación ya fue publicada; el modo local no permite revertirla.", history: [{ actor: "Docente demo", action: "Publicó resultados", date: "8 oct 2026 · 14:30", detail: "Resultado visible en la maqueta." }], publishable: false },
};

export function getAssessment(id: string): EvidenceAssessment { return ASSESSMENTS[id] ?? ASSESSMENTS["api-rest-section-b"]; }
