"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon } from "@/components/ds";
import type { NavigationItemConfig } from "./NavigationConfig";
import { isNavigationItemActive } from "./NavigationConfig";
import styles from "./AppShell.module.css";

export default function NavigationItem({ item, onNavigate }: { item: NavigationItemConfig; onNavigate?: () => void }) {
  const pathname = usePathname();
  const active = isNavigationItemActive(item, pathname ?? "");

  return (
    <Link
      href={item.href}
      className={`${styles.navigationItem} ${active ? styles.navigationItemActive : ""}`}
      aria-current={active ? "page" : undefined}
      title={item.state === "pending" ? `${item.label} — próximamente` : undefined}
      data-state={item.state}
      onClick={onNavigate}
    >
      <LucideIcon name={item.icon} size={17} color={active ? "var(--brand)" : "currentColor"} />
      <span>{item.label}</span>
      {item.state === "pending" && <span className={styles.pendingMark} aria-label="Próximamente">·</span>}
    </Link>
  );
}
