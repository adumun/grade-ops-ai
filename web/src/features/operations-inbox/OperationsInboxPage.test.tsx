import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OperationsInboxPage from "./OperationsInboxPage";
import { ShellProvider } from "@/components/shell/ShellContext";

const renderPage = () => render(<ShellProvider><OperationsInboxPage /></ShellProvider>);

jest.mock("./OperationsInboxPage.module.css", () => new Proxy({}, { get: (_target, property) => property }));

describe("OperationsInboxPage", () => {
  beforeEach(() => jest.useRealTimers());

  it("renders the four queues and the deterministic review queue", () => {
    renderPage();

    expect(screen.getByRole("tab", { name: "Preparar" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Revisar" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "Confirmar" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Aprobar" })).toBeInTheDocument();
    expect(screen.getByText("Revisar 12 entregas de API REST")).toBeInTheDocument();
  });

  it("combines queue selection, search and filters", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("tab", { name: "Confirmar" }));
    await user.type(screen.getByRole("textbox", { name: "Buscar operaciones" }), "feedback");

    expect(screen.getByText("Confirmar feedback generado por IA")).toBeInTheDocument();
    expect(screen.queryByText("Confirmar rúbrica de evaluación")).not.toBeInTheDocument();

    await user.selectOptions(screen.getByRole("combobox", { name: "Asignatura" }), "Ciencias Naturales");
    expect(screen.queryByText("Confirmar feedback generado por IA")).not.toBeInTheDocument();
    expect(screen.getByText("No hay coincidencias")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Limpiar filtros" }));
    expect(screen.getByText("Confirmar rúbrica de evaluación")).toBeInTheDocument();
  });

  it("preserves context through a failed action and retry", async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderPage();

    const search = screen.getByRole("textbox", { name: "Buscar operaciones" });
    await user.type(search, "entregas");
    const action = screen.getByRole("button", { name: "Revisar entregas" });
    await user.click(action);
    expect(action).toBeDisabled();
    act(() => jest.advanceTimersByTime(350));

    expect(screen.getByRole("alert")).toHaveTextContent("No se pudo completar");
    expect((search as HTMLInputElement).value).toBe("entregas");
    await user.click(screen.getByRole("button", { name: "Reintentar" }));
    act(() => jest.advanceTimersByTime(350));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getAllByRole("status").at(-1)).toHaveTextContent("completada en modo demo");
  });

  it("shows read-only and insufficient-permission states without active actions", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.selectOptions(screen.getByRole("combobox", { name: "Estado de demo" }), "readonly");
    expect(screen.getAllByRole("button", { name: "Sin permiso" })[0]).toBeDisabled();
    expect(screen.getAllByRole("button", { name: "Ver contexto" })[0]).toBeEnabled();

    await user.selectOptions(screen.getByRole("combobox", { name: "Estado de demo" }), "permission");
    expect(screen.getByRole("alert")).toHaveTextContent("No tienes permisos");
    expect(screen.getAllByRole("button", { name: "Sin permiso" })[0]).toBeDisabled();
  });

  it("renders loading, empty and recoverable global error states", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.selectOptions(screen.getByRole("combobox", { name: "Estado de demo" }), "loading");
    expect(screen.getByLabelText("Cargando Bandeja de Operaciones")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Buscar operaciones" })).toBeDisabled();

    await user.selectOptions(screen.getByRole("combobox", { name: "Estado de demo" }), "empty");
    expect(screen.getByText("No hay operaciones pendientes")).toBeInTheDocument();

    await user.selectOptions(screen.getByRole("combobox", { name: "Estado de demo" }), "error");
    expect(screen.getByRole("alert")).toHaveTextContent("No pudimos cargar la bandeja");
    await user.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(screen.getByText("Revisar 12 entregas de API REST")).toBeInTheDocument();
  });

  it("navigates to origin context and returns without losing the search", async () => {
    const user = userEvent.setup();
    renderPage();

    const search = screen.getByRole("textbox", { name: "Buscar operaciones" });
    await user.type(search, "entregas");
    await user.click(screen.getAllByRole("button", { name: "Ver contexto" })[0]);

    expect(screen.getAllByRole("status")[1]).toHaveTextContent("Operaciones / Revisión de API REST");
    await user.click(screen.getByRole("button", { name: "Volver a la bandeja" }));
    expect((search as HTMLInputElement).value).toBe("entregas");
  });
});
