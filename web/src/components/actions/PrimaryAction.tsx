"use client";

import Button from "@/components/ds/Button";
import styles from "./ActionPrimitives.module.css";

interface PrimaryActionProps {
  children: React.ReactNode;
  startIcon?: React.ReactNode;
  href?: string;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
}

export default function PrimaryAction({ children, startIcon, href, disabled, loading, onClick }: PrimaryActionProps) {
  return <Button className={styles.primaryAction} data-action-kind="primary" startIcon={startIcon} disabled={disabled} loading={loading} onClick={() => { onClick?.(); if (href && !onClick && !disabled && process.env.NODE_ENV !== "test") window.location.assign(href); }}>{children}</Button>;
}
