"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import LucideIcon from "@/components/ds/LucideIcon";
import styles from "./PageNotFound.module.css";

interface PageNotFoundProps {
  requestedPath: string;
  areaLabel?: string;
}

export default function PageNotFound({ requestedPath, areaLabel }: PageNotFoundProps) {
  const router = useRouter();

  return (
    <section className={styles.notFound} data-testid="not-found-page" aria-labelledby="not-found-title">
      <span className={styles.notFoundCode}>404</span>
      <div className={styles.contextStatus}><span className={styles.notFoundIcon} aria-hidden="true"><LucideIcon name="sparkles" size={16} /></span><span>Contexto insuficiente</span></div>
      <h1 id="not-found-title">Todavía no es evaluable</h1>
      <p className={styles.explanation}>La IA encontró la ruta, pero todavía no tiene evidencia suficiente para mostrar una vista confiable.</p>
      <div className={styles.contextCard}>
        <span className={styles.contextLabel}>Ruta solicitada</span>
        <code data-testid="requested-path">{requestedPath}</code>
        {areaLabel && <span className={styles.areaLabel} data-testid="area-label">Área: {areaLabel}</span>}
      </div>
      <div className={styles.actions}>
        <Link className={styles.homeLink} href="/preview">Volver al Inicio</Link>
        <button className={styles.backButton} type="button" onClick={() => router.back()}>Volver atrás</button>
      </div>
      <p className={styles.hint}>Cuando tengamos más contexto, esta vista estará lista para revisión.</p>
    </section>
  );
}
