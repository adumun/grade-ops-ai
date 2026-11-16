package cl.gradeops.ai.api.evaluation.infrastructure.adapter.in.web.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

public record CreateRubricRequest(
        @NotBlank @Size(max = 200) String title,
        @NotNull @DecimalMin("0.01") BigDecimal totalPoints,
        @NotEmpty @Size(max = 20) List<@Valid CriterionRequest> criteria) {

    public record CriterionRequest(
            String id,
            @NotBlank @Size(max = 120) String name,
            @NotBlank @Size(max = 2000) String description,
            @NotNull @DecimalMin("0.01") BigDecimal maxPoints,
            @NotEmpty List<@NotBlank @Size(max = 300) String> evidenceExpectations) {
    }
}
