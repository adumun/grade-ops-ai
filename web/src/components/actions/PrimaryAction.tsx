"use client";

import Button from "@/components/ds/Button";
import styles from "./ActionPrimitives.module.css";

interface PrimaryActionProps {
  children: React.ReactNode;
  href?: string;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
}

export default function PrimaryAction({ children, href, disabled, loading, onClick }: PrimaryActionProps) {
  return <Button className={styles.primaryAction} data-action-kind="primary" disabled={disabled} loading={loading} onClick={() => { onClick?.(); if (href && !disabled) window.location.assign(href); }}>{children}</Button>;
}
