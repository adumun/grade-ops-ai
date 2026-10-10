"use client";

import { useEffect, useState } from "react";
import AppLogo from "@/components/brand/AppLogo";
import { Avatar } from "@/components/ds";
import { NAVIGATION_CONFIG } from "./NavigationConfig";
import NavigationItem from "./NavigationItem";
import styles from "./AppShell.module.css";

export default function Sidebar({ id, onNavigate, mobile = false, onClose }: { id: string; onNavigate?: () => void; mobile?: boolean; onClose?: () => void }) {
  const [displayName, setDisplayName] = useState("Camila Rojas");

  useEffect(() => {
    setDisplayName("Camila Rojas");
  }, []);

  const navigate = () => {
    onNavigate?.();
    onClose?.();
  };

  return (
    <aside id={id} className={`${styles.sidebar} ${mobile ? styles.mobileSidebar : ""}`}>
      <div className={styles.sidebarBrand}>
        <AppLogo size="md" />
        {mobile && <button type="button" className={styles.drawerClose} onClick={onClose}>Cerrar navegación</button>}
      </div>
      <nav aria-label="Navegación principal" className={styles.sidebarNav}>
        {NAVIGATION_CONFIG.slice(0, 6).map((item) => <NavigationItem key={item.id} item={item} onNavigate={navigate} />)}
      </nav>
      <div className={styles.sidebarFooter}>
        {NAVIGATION_CONFIG.slice(6).map((item) => <NavigationItem key={item.id} item={item} onNavigate={navigate} />)}
        <div className={styles.sidebarUser}>
          <Avatar name={displayName} size="sm" />
          <div><strong>{displayName}</strong><small>Docente</small></div>
        </div>
      </div>
    </aside>
  );
}
