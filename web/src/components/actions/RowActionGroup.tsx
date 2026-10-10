import PrimaryAction from "./PrimaryAction";
import ContextAction from "./ContextAction";
import styles from "./ActionPrimitives.module.css";

interface RowActionGroupProps {
  primaryLabel: string;
  primaryHref?: string;
  primaryDisabled?: boolean;
  loading?: boolean;
  onPrimary?: () => void;
  contextHref?: string;
  contextDisabled?: boolean;
  onContext?: () => void;
}

export default function RowActionGroup({ primaryLabel, primaryHref, primaryDisabled = false, loading = false, onPrimary, contextHref, contextDisabled = false, onContext }: RowActionGroupProps) {
  return <div className={styles.rowActionGroup} data-testid="row-action-group"><PrimaryAction href={primaryHref} disabled={primaryDisabled} loading={loading} onClick={onPrimary}>{primaryLabel}</PrimaryAction><ContextAction href={contextHref} disabled={contextDisabled || loading} onClick={onContext} /></div>;
}
