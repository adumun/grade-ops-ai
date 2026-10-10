import Button from "@/components/ds/Button";
import styles from "./FilterBar.module.css";

interface ClearFiltersActionProps {
  disabled?: boolean;
  onClick: () => void;
}

export default function ClearFiltersAction({ disabled = false, onClick }: ClearFiltersActionProps) {
  return <div className={styles.clearFilters}><Button variant="ghost" size="sm" disabled={disabled} onClick={onClick}>Limpiar</Button></div>;
}
