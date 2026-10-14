import { fireEvent, render, screen } from "@testing-library/react";
import ObjectiveBuilder from "../ObjectiveBuilder";
import ObjectiveCoverageSummary from "../ObjectiveCoverageSummary";
import ObjectiveList from "../ObjectiveList";
import type { Material, Objective } from "../../domain/types";

const materials: Material[] = [{ id: "m1", name: "Guía de funciones", type: "pdf", status: "ready", sourceLabel: "Demo" }];
const proposal: Objective = { id: "proposal", title: "Descomponer problemas", description: "Propuesta demo", observableEvidence: "Implementa funciones", materialIds: ["m1"], status: "ready", source: "demo-ai", aiDecision: "pending" };

describe("objective components", () => {
  it("shows an empty ObjectiveSet and allows entering observable evidence and linked materials", () => {
    const onChange = jest.fn();
    const onToggleMaterial = jest.fn();
    render(<><ObjectiveBuilder values={{ title: "", description: "", observableEvidence: "", materialIds: [] }} materials={materials} validation={{ errors: {}, warnings: ["Falta definir qué debe poder demostrar el estudiante."], isReady: true }} editing={false} canEdit saveState="idle" onChange={onChange} onToggleMaterial={onToggleMaterial} onSubmit={jest.fn()} onCancel={jest.fn()} /><ObjectiveList objectives={[]} materials={materials} disabled={false} onEdit={jest.fn()} onRemove={jest.fn()} onDecision={jest.fn()} /></>);
    fireEvent.change(screen.getByRole("textbox", { name: "Evidencia observable" }), { target: { value: "Explica su estrategia" } });
    fireEvent.click(screen.getByRole("checkbox", { name: /guía de funciones/i }));
    expect(onChange).toHaveBeenCalledWith("observableEvidence", "Explica su estrategia");
    expect(onToggleMaterial).toHaveBeenCalledWith("m1");
    expect(screen.getAllByRole("status").find((status) => /aún no hay objetivos/i.test(status.textContent ?? ""))).toBeDefined();
  });

  it("disables objective editing while saving", () => {
    render(<ObjectiveBuilder values={{ title: "Aplicar", description: "", observableEvidence: "Demuestra", materialIds: ["m1"] }} materials={materials} validation={{ errors: {}, warnings: [], isReady: true }} editing={false} canEdit saveState="saving" onChange={jest.fn()} onToggleMaterial={jest.fn()} onSubmit={jest.fn()} onCancel={jest.fn()} />);
    expect(screen.getByRole("textbox", { name: "Objetivo medible" })).toBeDisabled();
    expect(screen.getByRole("button", { name: /agregar objetivo/i })).toBeDisabled();
  });

  it("offers an explicit human decision for the AI proposal", () => {
    const onDecision = jest.fn();
    const onEdit = jest.fn();
    render(<ObjectiveList objectives={[proposal]} materials={materials} disabled={false} onEdit={onEdit} onRemove={jest.fn()} onDecision={onDecision} />);
    expect(screen.getByText(/incertidumbre: propuesta basada en material demo/i)).toBeInTheDocument();
    expect(screen.getByText(/acción humana pendiente/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Aceptar propuesta" }));
    fireEvent.click(screen.getByRole("button", { name: "Editar propuesta" }));
    fireEvent.click(screen.getByRole("button", { name: "Rechazar propuesta" }));
    expect(onDecision).toHaveBeenNthCalledWith(1, "proposal", "accepted");
    expect(onEdit).toHaveBeenCalledWith(proposal);
    expect(onDecision).toHaveBeenNthCalledWith(2, "proposal", "rejected");
  });

  it("renders coverage warnings without blocking the summary", () => {
    render(<ObjectiveCoverageSummary coverage={{ total: 1, ready: 0, withoutEvidence: 1, withoutMaterials: 1, coveredMaterialIds: [], contentCoveragePercent: 0, warnings: ["1 objetivo sin evidencia observable."] }} />);
    expect(screen.getByText("1 objetivo sin evidencia observable.")).toBeInTheDocument();
    expect(screen.getByText(/advertencias no impiden guardar/i)).toBeInTheDocument();
    expect(screen.getByRole("meter")).toHaveAttribute("value", "0");
  });
});
