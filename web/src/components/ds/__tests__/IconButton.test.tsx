import { render, screen } from "@testing-library/react";
import IconButton from "../IconButton";
import LucideIcon from "../LucideIcon";

describe("IconButton", () => {
  it("exposes an accessible, centered icon action with configurable presentation", () => {
    render(
      <IconButton label="Abrir navegación" variant="solid" size="lg" shape="circle" iconSize={20} pressed>
        <LucideIcon name="menu" />
      </IconButton>,
    );

    const button = screen.getByRole("button", { name: "Abrir navegación" });
    expect(button).toHaveAttribute("title", "Abrir navegación");
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(button).toHaveClass("solid", "lg", "circle");
    expect(button.querySelector("svg")).toBeInTheDocument();
  });

  it("blocks interaction while loading and exposes busy state", () => {
    render(
      <IconButton label="Guardar cambios" loading>
        <LucideIcon name="save" />
      </IconButton>,
    );

    const button = screen.getByRole("button", { name: "Guardar cambios" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button.querySelector("svg")).not.toBeInTheDocument();
  });
});
