import type { ReactNode } from "react";
import styles from "./Page.module.css";

interface PageHeaderProps { eyebrow: string; title: string; description: string; actions?: ReactNode; }

export default function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return <header className={styles.pageHeader} data-layout="page-header"><div><span className={styles.eyebrow}>{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{actions && <div className={styles.pageHeaderActions}>{actions}</div>}</header>;
}
