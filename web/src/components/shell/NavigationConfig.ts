import type { LucideIconName } from "@/components/ds";

export type NavigationItemState = "available" | "pending";

export interface NavigationItemConfig {
  id: string;
  label: string;
  icon: LucideIconName;
  href: string;
  state: NavigationItemState;
}

export const NAVIGATION_CONFIG: readonly NavigationItemConfig[] = [
  { id: "home", label: "Inicio", icon: "layout-dashboard", href: "/preview", state: "available" },
  { id: "classes", label: "Mis clases", icon: "library", href: "/preview/classes", state: "pending" },
  { id: "operations", label: "Operaciones", icon: "clipboard-check", href: "/preview/operations", state: "available" },
  { id: "calendar", label: "Calendario", icon: "calendar-clock", href: "/preview/calendar", state: "pending" },
  { id: "resources", label: "Recursos", icon: "sparkles", href: "/preview/resources", state: "pending" },
  { id: "reports", label: "Reportes", icon: "bar-chart-3", href: "/preview/reports", state: "pending" },
  { id: "help", label: "Ayuda", icon: "eye", href: "/preview/help", state: "pending" },
  { id: "settings", label: "Configuración", icon: "lock", href: "/preview/settings", state: "pending" },
] as const;

export function isNavigationItemActive(item: NavigationItemConfig, pathname: string): boolean {
  return item.href === "/preview" ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
}
