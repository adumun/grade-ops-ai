import type { ReactNode } from "react";
import ClearFiltersAction from "./ClearFiltersAction";
import styles from "./FilterBar.module.css";

interface FilterBarProps {
  children: ReactNode;
  ariaLabel: string;
  busy?: boolean;
  clearDisabled?: boolean;
  onClear: () => void;
}

export function FilterBar({ children, ariaLabel, busy = false, clearDisabled = false, onClear }: FilterBarProps) {
  return <div className={styles.filterBar} data-testid="filter-bar" aria-label={ariaLabel} aria-busy={busy}>{children}<ClearFiltersAction disabled={clearDisabled} onClick={onClear} /></div>;
}

interface FilterFieldProps {
  label: string;
  children: ReactNode;
}

export function FilterField({ label, children }: FilterFieldProps) {
  return <label className={styles.filterField} data-filter-field="true"><span className={styles.filterLabel}>{label}</span><span className={styles.filterControl}>{children}</span></label>;
}
