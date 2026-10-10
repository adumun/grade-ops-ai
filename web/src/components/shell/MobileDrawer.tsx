"use client";

import Sidebar from "./Sidebar";
import styles from "./AppShell.module.css";

export default function MobileDrawer({ open, onClose, id }: { open: boolean; onClose: () => void; id: string }) {
  if (!open) return null;

  return (
    <>
      <button type="button" className={styles.drawerOverlay} aria-label="Cerrar navegación" onClick={onClose} />
      <Sidebar id={`${id}-mobile`} mobile onClose={onClose} />
    </>
  );
}
