import { render, screen } from "@testing-library/react";
import AssessmentProgress, { getAssessmentProgressState } from "../AssessmentProgress";

describe("AssessmentProgress", () => {
  it("marks Propósito as the active first stage", () => {
    render(<AssessmentProgress currentStage="purpose" />);

    expect(screen.getByRole("link", { name: /1\. propósito — etapa actual/i })).toHaveAttribute("aria-current", "step");
    expect(screen.getByLabelText(/2\. contenidos — pendiente/i)).toBeInTheDocument();
  });

  it("completes Propósito and activates Contenidos", () => {
    render(<AssessmentProgress currentStage="content" />);

    expect(screen.getByLabelText(/1\. propósito — completado/i).closest("li")).toHaveAttribute("data-progress-state", "completed");
    expect(screen.getByRole("link", { name: /2\. contenidos — etapa actual/i })).toHaveAttribute("aria-current", "step");
  });

  it("completes previous stages and activates Objetivos", () => {
    render(<AssessmentProgress currentStage="objectives" />);

    expect(screen.getByLabelText(/1\. propósito — completado/i).closest("li")).toHaveAttribute("data-progress-state", "completed");
    expect(screen.getByLabelText(/2\. contenidos — completado/i).closest("li")).toHaveAttribute("data-progress-state", "completed");
    expect(screen.getByRole("link", { name: /3\. objetivos — etapa actual/i })).toHaveAttribute("aria-current", "step");
  });

  it("completes previous stages and activates the available rubric", () => {
    render(<AssessmentProgress currentStage="rubric" />);

    expect(screen.getByRole("link", { name: /4\. rúbricas — etapa actual/i })).toHaveAttribute("aria-current", "step");
    expect(document.querySelectorAll('[data-progress-state="completed"]')).toHaveLength(3);
  });

  it("exposes deterministic state rules independently from rendering", () => {
    expect(getAssessmentProgressState("content", "purpose")).toBe("completed");
    expect(getAssessmentProgressState("content", "content")).toBe("active");
    expect(getAssessmentProgressState("objectives", "rubric")).toBe("pending");
    expect(getAssessmentProgressState("rubric", "objectives")).toBe("completed");
  });
});
