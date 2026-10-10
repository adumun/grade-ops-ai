import type { ReactNode } from "react";
import styles from "./Page.module.css";

export default function PageSection({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`${styles.pageSection} ${className}`}>{children}</section>;
}
