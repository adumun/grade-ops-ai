"use client";

import styles from "./IconButton.module.css";

export type IconButtonVariant = "ghost" | "outline" | "solid";
export type IconButtonSize = "sm" | "md" | "lg";
export type IconButtonShape = "square" | "circle";

interface IconButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "style"> {
  /** Accessible name and native tooltip for the icon-only action. */
  label: string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  shape?: IconButtonShape;
  /** Explicit icon box size; defaults to the Design System size token. */
  iconSize?: number;
  loading?: boolean;
  pressed?: boolean;
  children: React.ReactNode;
  ref?: React.Ref<HTMLButtonElement>;
  className?: string;
}

export default function IconButton({
  label,
  variant = "ghost",
  size = "md",
  shape = "square",
  iconSize,
  loading = false,
  pressed,
  children,
  disabled,
  className = "",
  ref,
  ...props
}: IconButtonProps) {
  const isDisabled = disabled || loading;
  const classNames = [styles.button, styles[variant], styles[size], styles[shape], loading ? styles.loading : "", className].filter(Boolean).join(" ");

  return (
    <button
      ref={ref}
      type="button"
      className={classNames}
      title={label}
      aria-label={label}
      aria-pressed={pressed}
      aria-busy={loading || undefined}
      disabled={isDisabled}
      style={iconSize ? { "--icon-button-icon-size": `${iconSize}px` } as React.CSSProperties : undefined}
      {...props}
    >
      {loading ? <span className={styles.spinner} aria-hidden="true" /> : children}
    </button>
  );
}
