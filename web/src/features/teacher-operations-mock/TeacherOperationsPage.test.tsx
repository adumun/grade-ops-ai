import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TeacherOperationsPage from "./TeacherOperationsPage";

jest.mock("./TeacherOperationsPage.module.css", () => ({
  previewFrame: "previewFrame",
  topbar: "topbar",
  mobileMenuButton: "mobileMenuButton",
  search: "search",
  topbarActions: "topbarActions",
  hideOnMobile: "hideOnMobile",
  teacher: "teacher",
  avatar: "avatar",
  sidebar: "sidebar",
  sidebarOpen: "sidebarOpen",
  logo: "logo",
  logoMark: "logoMark",
  drawerClose: "drawerClose",
  sidebarNav: "sidebarNav",
  navItem: "navItem",
  navActive: "navActive",
  sidebarFooter: "sidebarFooter",
  sidebarUser: "sidebarUser",
  drawerOverlay: "drawerOverlay",
  appArea: "appArea",
  pageContent: "pageContent",
  pageIntro: "pageIntro",
  eyebrow: "eyebrow",
  demoControls: "demoControls",
  contextBar: "contextBar",
  contextLabel: "contextLabel",
  filters: "filters",
  filterNotice: "filterNotice",
  globalError: "globalError",
  primarySection: "primarySection",
  sectionHeading: "sectionHeading",
  sectionKicker: "sectionKicker",
  queue: "queue",
  queueItem: "queueItem",
  priority: "priority",
  queueMain: "queueMain",
  itemHeading: "itemHeading",
  reason: "reason",
  itemFooter: "itemFooter",
  itemActions: "itemActions",
  secondaryGrid: "secondaryGrid",
  secondarySection: "secondarySection",
  list: "list",
  compactRow: "compactRow",
  followUpSummary: "followUpSummary",
  feedbackList: "feedbackList",
  mutedState: "mutedState",
  shortcuts: "shortcuts",
  shortcutActions: "shortcutActions",
  stateLegend: "stateLegend",
  loadingStack: "loadingStack",
  skeletonCard: "skeletonCard",
  emptyState: "emptyState",
  routeNotice: "routeNotice",
  notice: "notice",
}));

describe("TeacherOperationsPage states", () => {
  it("centers the empty queue content in its own primary area", async () => {
    const user = userEvent.setup();
    render(<TeacherOperationsPage />);

    await user.selectOptions(screen.getByLabelText("Estado de demo"), "empty");

    const emptyState = screen.getByText("No tienes tareas pendientes").parentElement;
    expect(emptyState).toHaveClass("emptyState");
    expect(emptyState?.closest("section")).toHaveAttribute("aria-labelledby", "attention-title");
    expect(screen.getByRole("button", { name: /ver todas en operaciones/i })).toBeInTheDocument();
  });

  it("disables data-dependent actions while loading but leaves global navigation available", async () => {
    const user = userEvent.setup();
    render(<TeacherOperationsPage />);

    await user.selectOptions(screen.getByLabelText("Estado de demo"), "loading");

    expect(screen.getAllByLabelText("Cargando Inicio").length).toBe(2);
    expect(screen.getByLabelText("institution")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Limpiar" })).toBeDisabled();
    expect(screen.getByRole("button", { name: /ver todas en operaciones/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Ver calendario" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Ver en Operaciones" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Abrir navegación" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Notificaciones" })).toBeEnabled();
  });
});
