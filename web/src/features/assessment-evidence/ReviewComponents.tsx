import type { ReviewQuestion, RubricCriterion } from "./data";
import styles from "./ReviewComponents.module.css";

export function ReviewQuestion({ question }: { question: ReviewQuestion }) {
  return <article className={styles.question}><div className={styles.questionHeader}><span>{question.type}</span><strong className={styles[question.answerState]}>{question.answerState}</strong></div><h3>{question.prompt}</h3><p>{question.answer || "Sin respuesta"}</p></article>;
}

export function ReviewAnswer({ label, value, state }: { label: string; value: string; state?: string }) {
  return <div className={styles.answer}><span>{label}</span><strong>{value || "Sin respuesta"}</strong>{state && <em>{state}</em>}</div>;
}

export function ReviewRubric({ criteria }: { criteria: RubricCriterion[] }) {
  return <div className={styles.rubric}>{criteria.map((criterion) => <article className={styles.criterion} key={criterion.name}><div><strong>{criterion.name}</strong><span>{criterion.evidence}</span></div><div><b>{criterion.level}</b><small>{criterion.score}</small></div></article>)}</div>;
}

export function ReviewFeedback({ suggestion, uncertainty }: { suggestion: string; uncertainty: string }) {
  return <div className={styles.feedback}><span>Sugerencia IA · no es decisión final</span><p>{suggestion}</p><small>Incertidumbre: {uncertainty}</small></div>;
}

export function ReviewDecision({ score, comment }: { score: string; comment: string }) {
  return <div className={styles.decisionSummary}><div><span>Puntuación / nivel de logro</span><strong>{score}</strong></div><label htmlFor="teacher-comment">Comentario docente</label><textarea id="teacher-comment" defaultValue={comment} placeholder="Registra la decisión o el siguiente paso…" /></div>;
}
