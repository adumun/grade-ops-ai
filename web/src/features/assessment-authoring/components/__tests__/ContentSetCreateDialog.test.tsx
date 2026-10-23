import { fireEvent, render, screen } from "@testing-library/react";
import ContentSetCreateDialog from "../ContentSetCreateDialog";

describe("ContentSetCreateDialog", () => {
  it("validates the name and returns the new reusable set", () => {
    const onCreate = jest.fn();
    render(<ContentSetCreateDialog open canEdit fixtures={[]} onClose={jest.fn()} onCreate={onCreate} />);

    fireEvent.click(screen.getByRole("button", { name: /^crear contenido$/i }));
    expect(screen.getByText(/ingresa un nombre para crear el contenido/i)).toBeInTheDocument();

    fireEvent.change(screen.getByRole("textbox", { name: /nombre del contenido/i }), { target: { value: "Funciones y modularidad" } });
    fireEvent.change(screen.getByRole("textbox", { name: /descripción/i }), { target: { value: "Base reutilizable" } });
    fireEvent.click(screen.getByRole("button", { name: /^crear contenido$/i }));

    expect(onCreate).toHaveBeenCalledWith({ name: "Funciones y modularidad", description: "Base reutilizable", materialIds: [] });
  });
});
