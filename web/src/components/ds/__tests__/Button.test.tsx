import { fireEvent, render, screen } from "@testing-library/react";
import Button from "../Button";
import LucideIcon from "../LucideIcon";

describe("Button", () => {
  it("exposes the primary, secondary and ghost visual contracts", () => {
    render(<><Button>Primaria</Button><Button variant="secondary">Secundaria</Button><Button variant="ghost">Texto</Button></>);

    expect(screen.getByRole("button", { name: "Primaria" })).toHaveAttribute("data-variant", "primary");
    expect(screen.getByRole("button", { name: "Secundaria" })).toHaveAttribute("data-variant", "secondary");
    expect(screen.getByRole("button", { name: "Texto" })).toHaveAttribute("data-variant", "ghost");
  });

  it("supports the legacy outline alias without changing the secondary contract", () => {
    expect(render(<Button variant="outline">Cancelar</Button>).getByRole("button")).toHaveAttribute("data-variant", "secondary");
  });

  it("blocks disabled and loading actions while exposing loading state", () => {
    const onClick = jest.fn();
    render(<><Button disabled onClick={onClick}>Deshabilitado</Button><Button loading onClick={onClick}>Guardando</Button></>);

    const disabled = screen.getByRole("button", { name: "Deshabilitado" });
    const loading = screen.getByRole("button", { name: "Guardando" });
    expect(disabled).toBeDisabled();
    expect(loading).toBeDisabled();
    expect(loading).toHaveAttribute("aria-busy", "true");
    fireEvent.click(disabled);
    fireEvent.click(loading);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("renders start and end icons without polluting the accessible name", () => {
    render(<Button startIcon={<LucideIcon name="save" size={16} />} endIcon={<LucideIcon name="arrow-left" size={16} />}>Guardar</Button>);

    const button = screen.getByRole("button", { name: "Guardar" });
    expect(button.querySelectorAll("svg")).toHaveLength(2);
    expect(button.querySelectorAll("svg[aria-hidden=\"true\"]")).toHaveLength(2);
  });

  it("supports an accessible icon-only button", () => {
    render(<Button aria-label="Guardar cambios" startIcon={<LucideIcon name="save" size={18} />} />);

    expect(screen.getByRole("button", { name: "Guardar cambios" })).toBeInTheDocument();
  });
});
