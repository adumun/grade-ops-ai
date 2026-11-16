package cl.gradeops.ai.api.evaluation.infrastructure.adapter.in.web.request;

import cl.gradeops.ai.api.evaluation.application.model.GradingProposal;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateGradingReviewRequest(
        @NotNull @Valid GradingProposal editedResult,
        @Size(max = 4000) String teacherComment) {
}
