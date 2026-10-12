import PrimaryAction from "./PrimaryAction";
import ContextAction from "./ContextAction";
import styles from "./ActionPrimitives.module.css";

interface RowActionGroupProps {
  primaryLabel: string;
  primaryIcon?: React.ReactNode;
  primaryHref?: string;
  primaryDisabled?: boolean;
  loading?: boolean;
  onPrimary?: () => void;
  contextHref?: string;
  contextDisabled?: boolean;
  onContext?: () => void;
}

export default function RowActionGroup({ primaryLabel, primaryIcon, primaryHref, primaryDisabled = false, loading = false, onPrimary, contextHref, contextDisabled = false, onContext }: RowActionGroupProps) {
  return <div className={styles.rowActionGroup} data-testid="row-action-group"><PrimaryAction href={primaryHref} startIcon={primaryIcon} disabled={primaryDisabled} loading={loading} onClick={onPrimary}>{primaryLabel}</PrimaryAction><ContextAction href={contextHref} disabled={contextDisabled || loading} onClick={onContext} /></div>;
}
