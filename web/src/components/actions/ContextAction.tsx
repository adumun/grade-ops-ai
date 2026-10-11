"use client";

import Button from "@/components/ds/Button";
import styles from "./ActionPrimitives.module.css";

interface ContextActionProps {
  href?: string;
  disabled?: boolean;
  onClick?: () => void;
}

export default function ContextAction({ href, disabled, onClick }: ContextActionProps) {
  return <Button className={styles.contextAction} data-action-kind="context" variant="ghost" size="sm" disabled={disabled} onClick={() => { onClick?.(); if (href && !disabled && process.env.NODE_ENV !== "test") window.location.assign(href); }}>Ver contexto</Button>;
}
