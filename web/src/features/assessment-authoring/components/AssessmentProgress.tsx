import Link from "next/link";
import Badge from "@/components/ds/Badge";
import styles from "./AssessmentAuthoring.module.css";

export type AssessmentAuthoringStage = "purpose" | "content" | "objectives" | "rubric";
export type AssessmentProgressState = "completed" | "active" | "pending" | "blocked";

type AssessmentProgressStep = {
  stage: AssessmentAuthoringStage;
  label: string;
  href: string;
};

export const assessmentAuthoringSteps: readonly AssessmentProgressStep[] = [
  { stage: "purpose", label: "Propósito", href: "/preview/assessments/new/purpose" },
  { stage: "content", label: "Contenidos", href: "/preview/assessments/new/content" },
  { stage: "objectives", label: "Objetivos", href: "/preview/assessments/new/objectives" },
  { stage: "rubric", label: "Rúbricas", href: "/preview/assessments/new/rubric" },
];

const stageOrder: Record<AssessmentAuthoringStage, number> = {
  purpose: 0,
  content: 1,
  objectives: 2,
  rubric: 3,
};

export function getAssessmentProgressState(
  stage: AssessmentAuthoringStage,
  step: AssessmentAuthoringStage,
): AssessmentProgressState {
  if (step === stage) return "active";
  return stageOrder[step] < stageOrder[stage] ? "completed" : "pending";
}

interface AssessmentProgressProps {
  currentStage: AssessmentAuthoringStage;
}

export default function AssessmentProgress({ currentStage }: AssessmentProgressProps) {
  return (
    <nav className={styles.progress} aria-label="Progreso de autoría de la evaluación">
      <ol className={styles.progressSteps}>
        {assessmentAuthoringSteps.map((step, index) => {
          const state = getAssessmentProgressState(currentStage, step.stage);
          const stateLabel = state === "completed" ? "completado" : state === "active" ? "etapa actual" : state === "blocked" ? "etapa futura no disponible" : "pendiente";
          const stepLabel = `${index + 1}. ${step.label} — ${stateLabel}`;
          const content = <><strong aria-hidden="true">{index + 1}</strong><span>{step.label}</span><span className={styles.srOnly}> — {stateLabel}</span></>;

          return (
            <li key={step.stage} className={`${styles.progressStep} ${styles[`progressStep${state[0].toUpperCase()}${state.slice(1)}`]}`} data-progress-state={state}>
              <Link href={step.href} aria-current={state === "active" ? "step" : undefined} aria-label={stepLabel}>{content}</Link>
            </li>
          );
        })}
      </ol>
      <Badge tone="neutral">Borrador local</Badge>
    </nav>
  );
}
