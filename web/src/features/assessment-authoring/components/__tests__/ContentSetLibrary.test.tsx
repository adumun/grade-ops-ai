import { fireEvent, render, screen } from "@testing-library/react";
import ContentSetLibrary from "../ContentSetLibrary";
import type { ContentSet } from "../../domain/types";

const sets: ContentSet[] = [
  { id: "functions", name: "Funciones", description: "Material base", materials: [], status: "draft", updatedAt: "2026-10-12T00:00:00.000Z" },
];

describe("ContentSetLibrary", () => {
  it("selects an existing reusable set or starts a new one", () => {
    const onSelect = jest.fn();
    const onCreate = jest.fn();
    render(<ContentSetLibrary contentSets={sets} selectedIds={["functions"]} canEdit onSelect={onSelect} onCreate={onCreate} />);

    expect(screen.getByRole("heading", { name: "Selecciona contenidos" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /funciones/i }));
    fireEvent.click(screen.getByRole("button", { name: /crear contenido nuevo/i }));
    expect(onSelect).toHaveBeenCalledWith("functions");
    expect(onCreate).toHaveBeenCalledTimes(1);
  });
});
