import type { ReactNode } from "react";
import styles from "./Page.module.css";

export default function Page({ children }: { children: ReactNode }) {
  return <div className={styles.page} data-layout="page">{children}</div>;
}
