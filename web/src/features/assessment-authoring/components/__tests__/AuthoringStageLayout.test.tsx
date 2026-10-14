import { render, screen } from "@testing-library/react";
import Link from "next/link";
import AuthoringStageLayout, { AuthoringStageFooter } from "../AuthoringStageLayout";
import type { AssessmentAuthoringStage } from "../AssessmentProgress";

const stages: Array<[AssessmentAuthoringStage, string]> = [
  ["purpose", "Propósito"],
  ["content", "Contenidos"],
  ["objectives", "Objetivos"],
  ["rubric", "Rúbricas"],
];

describe("AuthoringStageLayout", () => {
  it.each(stages)("uses the shared frame and active step for %s", (stage, label) => {
    render(
      <AuthoringStageLayout
        stage={stage}
        eyebrow="Nueva evaluación · Vista previa local"
        title={`Etapa ${label}`}
        description="Descripción de etapa"
        backAction={<Link href="/preview/assessments">Volver</Link>}
        aside={<aside aria-label="Resumen de etapa">Resumen</aside>}
        footer={<><button type="button">Guardar</button><Link href="/preview/assessments/new/next">Continuar</Link></>}
      >
        <section aria-label="Contenido de etapa">Contenido</section>
      </AuthoringStageLayout>,
    );

    expect(document.querySelector('[data-layout="page-header"]')).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Progreso de autoría de la evaluación" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: new RegExp(label, "i") })).toHaveAttribute("aria-current", "step");
    expect(screen.getByLabelText("Contenido de etapa")).toBeInTheDocument();
    expect(screen.getByLabelText("Resumen de etapa")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toContainElement(screen.getByRole("button", { name: "Guardar" }));
  });

  it("provides the same footer landmark when used independently", () => {
    render(<AuthoringStageFooter><button type="button">Guardar borrador</button></AuthoringStageFooter>);

    expect(screen.getByRole("contentinfo")).toContainElement(screen.getByRole("button", { name: "Guardar borrador" }));
  });
});
