"use client";

import styles from "./IconButton.module.css";

interface IconButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "style"> {
  label: string;
  size?: "sm" | "md";
  children: React.ReactNode;
  ref?: React.Ref<HTMLButtonElement>;
  className?: string;
}

export default function IconButton({ label, size = "md", children, className = "", ref, ...props }: IconButtonProps) {
  return <button ref={ref} type="button" className={[styles.button, styles[size], className].filter(Boolean).join(" ")} title={label} aria-label={label} {...props}>{children}</button>;
}
