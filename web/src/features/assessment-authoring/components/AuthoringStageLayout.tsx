import type { ReactNode } from "react";
import Page from "@/components/shell/Page";
import PageHeader from "@/components/shell/PageHeader";
import AssessmentProgress, { type AssessmentAuthoringStage } from "./AssessmentProgress";
import styles from "./AuthoringStageLayout.module.css";

type Props = {
  stage: AssessmentAuthoringStage;
  eyebrow: string;
  title: string;
  description: string;
  backAction: ReactNode;
  children: ReactNode;
  aside?: ReactNode;
  readOnlyNotice?: ReactNode;
  footer?: ReactNode;
};

/** Shared visual composition for local assessment-authoring stages. */
export default function AuthoringStageLayout({ stage, eyebrow, title, description, backAction, children, aside, readOnlyNotice, footer }: Props) {
  return (
    <Page>
      <section className={styles.frame} data-layout="authoring-stage">
        <PageHeader eyebrow={eyebrow} title={title} description={description} actions={backAction} />
        <div className={styles.stepper}><AssessmentProgress currentStage={stage} /></div>
        {readOnlyNotice}
        <div className={`${styles.content} ${aside ? styles.withAside : ""}`}>
          <div className={styles.primary}>{children}</div>
          {aside && <div className={styles.secondary}>{aside}</div>}
        </div>
        {footer && <AuthoringStageFooter>{footer}</AuthoringStageFooter>}
      </section>
    </Page>
  );
}

export function AuthoringStageFooter({ children }: { children: ReactNode }) {
  return <footer className={styles.footer} data-layout="authoring-stage-footer">{children}</footer>;
}
