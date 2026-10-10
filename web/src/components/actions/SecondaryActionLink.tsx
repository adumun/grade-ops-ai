import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./ActionPrimitives.module.css";

export default function SecondaryActionLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link className={styles.secondaryActionLink} href={href}>{children}</Link>;
}
