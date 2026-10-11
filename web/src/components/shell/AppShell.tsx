"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { IconButton, LucideIcon } from "@/components/ds";
import Sidebar from "./Sidebar";
import MobileDrawer from "./MobileDrawer";
import { useShell } from "./ShellContext";
import DemoStateSelector from "./DemoStateSelector";
import styles from "./AppShell.module.css";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const navigationId = pathname?.startsWith("/preview/operations") ? "operations-inbox-nav" : "teacher-home-nav";
  const { config } = useShell();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDrawerOpen(false);
        requestAnimationFrame(() => menuButtonRef.current?.focus());
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [drawerOpen]);

  const closeDrawer = () => {
    setDrawerOpen(false);
    requestAnimationFrame(() => menuButtonRef.current?.focus());
  };

  return (
    <div className={styles.shell}>
      <Sidebar id={navigationId} />
      <MobileDrawer id={navigationId} open={drawerOpen} onClose={closeDrawer} />
      <div className={styles.appArea}>
        <header className={styles.topbar} data-layout="shell-header">
          <div className={styles.mobileMenuButton}>
            <IconButton ref={menuButtonRef} label="Abrir navegación" aria-expanded={drawerOpen} aria-controls={navigationId} onClick={() => setDrawerOpen((open) => !open)}>
              <LucideIcon name="menu" size={18} />
            </IconButton>
          </div>
          <div className={styles.searchHint}><LucideIcon name="search" size={16} /><span>Buscar en GradeOps…</span></div>
          <div className={styles.topbarHeading}>
            <h1>{config.title}</h1>
            {config.subtitle && <p>{config.subtitle}</p>}
          </div>
          <div className={styles.topbarActions}>
            <IconButton label="Notificaciones"><LucideIcon name="bell" size={18} /></IconButton>
            <DemoStateSelector />
            {config.actions}
          </div>
        </header>
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
