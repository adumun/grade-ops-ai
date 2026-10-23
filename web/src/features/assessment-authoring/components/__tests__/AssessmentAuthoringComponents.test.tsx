import { fireEvent, render, screen } from "@testing-library/react";
import AssessmentEmptyState from "../AssessmentEmptyState";
import AssessmentPurposeSection from "../AssessmentPurposeSection";
import ContentSetSection from "../ContentSetSection";
import MaterialList from "../MaterialList";

describe("assessment authoring components", () => {
  it("offers the first-evaluation action from the true empty state", () => {
    render(<AssessmentEmptyState />);
    expect(screen.getByRole("heading", { name: /aún no tienes evaluaciones configuradas/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /crear mi primera evaluación/i })).toHaveAttribute("href", "/preview/assessments/new/purpose");
    expect(screen.getByText(/institución, el curso, la sección y los alumnos/i)).toBeInTheDocument();
  });

  it("edits all minimum fields and exposes validation after a save request", () => {
    const onChange = jest.fn();
    render(<AssessmentPurposeSection values={{ title: "", topic: "", purpose: "" }} validation={{ errors: { title: "Ingresa un título para guardar la evaluación." }, warnings: [], isReady: false }} validationRequested canEdit saveState="idle" onChange={onChange} onSave={jest.fn()} onRetry={jest.fn()} onCancel={jest.fn()} />);
    expect(screen.getByRole("textbox", { name: /^Título/ })).toHaveAttribute("id", "assessment-title");
    expect(screen.getByRole("textbox", { name: "Temática" })).toHaveAttribute("id", "assessment-topic");
    expect(screen.getByRole("textbox", { name: "Propósito pedagógico" })).toHaveAttribute("id", "assessment-purpose");
    expect(screen.getByText("Ingresa un título para guardar la evaluación.")).toBeInTheDocument();
    fireEvent.change(screen.getByRole("textbox", { name: /^Título/ }), { target: { value: "Evaluación inicial" } });
    fireEvent.change(screen.getByRole("textbox", { name: "Temática" }), { target: { value: "Funciones" } });
    fireEvent.change(screen.getByRole("textbox", { name: "Propósito pedagógico" }), { target: { value: "Demostrar composición" } });
    expect(onChange).toHaveBeenNthCalledWith(1, "title", "Evaluación inicial");
    expect(onChange).toHaveBeenNthCalledWith(2, "topic", "Funciones");
    expect(onChange).toHaveBeenNthCalledWith(3, "purpose", "Demostrar composición");
  });

  it("disables editing and actions while saving, and exposes retry on error", () => {
    const onRetry = jest.fn();
    const { unmount } = render(<AssessmentPurposeSection values={{ title: "Evaluación", topic: "Funciones", purpose: "Propósito" }} validation={{ errors: {}, warnings: [], isReady: true }} validationRequested={false} canEdit saveState="saving" onChange={jest.fn()} onSave={jest.fn()} onRetry={onRetry} onCancel={jest.fn()} />);
    expect(screen.getByRole("textbox", { name: /^Título/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: /guardar borrador/i })).toBeDisabled();
    unmount();

    render(<AssessmentPurposeSection values={{ title: "Evaluación", topic: "Funciones", purpose: "Propósito" }} validation={{ errors: {}, warnings: [], isReady: true }} validationRequested={false} canEdit saveState="error" onChange={jest.fn()} onSave={jest.fn()} onRetry={onRetry} onCancel={jest.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("renders the empty content set and material statuses with accessible actions", () => {
    render(<MaterialList materials={[]} disabled={false} onRemove={jest.fn()} onMove={jest.fn()} />);
    expect(screen.getByRole("status")).toHaveTextContent(/aún no agregas materiales/i);
    render(<MaterialList materials={[{ id: "m1", name: "Taller.pptx", type: "pptx", status: "processing", sourceLabel: "Biblioteca demo", description: "Pendiente" }]} disabled={false} onRemove={jest.fn()} onMove={jest.fn()} />);
    expect(screen.getByText("Procesando")).toBeInTheDocument();
    expect(screen.getByText(/extracción demo todavía está pendiente/i)).toBeInTheDocument();
  });

  it("edits a content set and disables it while saving", () => {
    const onChange = jest.fn();
    render(<ContentSetSection values={{ name: "", description: "" }} validation={{ errors: { name: "Ingresa un nombre para el conjunto." }, isReady: false }} validationRequested mode="new" canEdit saveState="saving" onChange={onChange} onSave={jest.fn()} onRetry={jest.fn()} onCancel={jest.fn()} />);
    expect(screen.getByRole("textbox", { name: /nombre del conjunto/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /guardar conjunto/i })).toBeDisabled();
  });
});
