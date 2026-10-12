"use client";

import type { ReactNode } from "react";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "link";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "style"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  block?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  /** Backwards-compatible alias; prefer endIcon in new code. */
  iconRight?: ReactNode;
  className?: string;
  ref?: React.Ref<HTMLButtonElement>;
}

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  block = false,
  startIcon,
  endIcon,
  iconRight,
  children,
  disabled,
  className = "",
  ref,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const visualVariant = variant === "outline" ? "secondary" : variant;
  const trailingIcon = endIcon ?? iconRight;
  const classNames = [styles.button, styles[visualVariant], styles[size], block ? styles.block : "", className].filter(Boolean).join(" ");

  return (
    <button
      ref={ref}
      className={classNames}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      data-variant={visualVariant}
      {...props}
    >
      {loading ? <span className={styles.spinner} aria-hidden="true" /> : startIcon && <span className={styles.icon} aria-hidden="true">{startIcon}</span>}
      {children !== undefined && <span className={styles.label}>{children}</span>}
      {!loading && trailingIcon && <span className={styles.icon} aria-hidden="true">{trailingIcon}</span>}
    </button>
  );
}
