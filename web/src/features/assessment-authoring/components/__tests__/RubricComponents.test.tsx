import { fireEvent, render, screen } from "@testing-library/react";
import RubricAiProposal from "../RubricAiProposal";
import RubricCoverageSummary from "../RubricCoverageSummary";
import RubricEditor from "../RubricEditor";
import type { Objective, RubricCriterion } from "../../domain/types";

const objective: Objective = { id: "o1", title: "Aplicar funciones", description: "", observableEvidence: "Implementa", materialIds: [], status: "ready", source: "manual" };
const criterion: RubricCriterion = { id: "c1", title: "Diseño", description: "", weight: 100, objectiveIds: [], levels: [{ id: "l1", label: "Logro", descriptor: "Descriptor", score: 4 }] };

describe("rubric components", () => {
  it("edits criteria, levels, objective links and exposes actions", () => {
    const onChange = jest.fn(); const onToggle = jest.fn(); const onLevel = jest.fn(); const onAdd = jest.fn();
    render(<RubricEditor criteria={[criterion]} objectives={[objective]} disabled={false} onAdd={onAdd} onChange={onChange} onToggleObjective={onToggle} onAddLevel={jest.fn()} onUpdateLevel={onLevel} onRemoveLevel={jest.fn()} onMove={jest.fn()} onRemove={jest.fn()} />);
    fireEvent.change(screen.getByRole("textbox", { name: "Nombre del criterio" }), { target: { value: "Implementación" } });
    fireEvent.click(screen.getByRole("checkbox", { name: "Aplicar funciones" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Descriptor" }), { target: { value: "Nuevo descriptor" } });
    fireEvent.click(screen.getByRole("button", { name: "Agregar criterio" }));
    expect(onChange).toHaveBeenCalledWith("c1", "title", "Implementación");
    expect(onToggle).toHaveBeenCalledWith("c1", "o1");
    expect(onLevel).toHaveBeenCalledWith("c1", "l1", "descriptor", "Nuevo descriptor");
    expect(onAdd).toHaveBeenCalled();
  });
  it("keeps AI decisions human and displays readiness warnings", () => {
    const onDecision = jest.fn();
    render(<><RubricAiProposal decision="pending" disabled={false} onDecision={onDecision} /><RubricCoverageSummary readiness={{ isReady: false, weightTotal: 60, weightState: "incomplete", objectivesWithoutCriterion: ["Aplicar"], duplicateCriteria: [], blockers: ["La suma de pesos debe llegar a 100%."], warnings: ["1 objetivo(s) aún no tienen criterio."] }} /></>);
    fireEvent.click(screen.getByRole("button", { name: "Aceptar propuesta" }));
    fireEvent.click(screen.getByRole("button", { name: "Editar propuesta" }));
    fireEvent.click(screen.getByRole("button", { name: "Rechazar propuesta" }));
    expect(onDecision.mock.calls).toEqual([["accepted"], ["edited"], ["rejected"]]);
    expect(screen.getByText("La suma de pesos debe llegar a 100%.")).toBeInTheDocument();
  });
});
