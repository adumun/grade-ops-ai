package cl.gradeops.ai.api.evaluation.application.model;

import java.math.BigDecimal;
import java.util.List;

public record RubricCriterion(
        String id,
        String name,
        String description,
        BigDecimal maxPoints,
        List<String> evidenceExpectations) {

    public RubricCriterion {
        evidenceExpectations = evidenceExpectations == null ? List.of() : List.copyOf(evidenceExpectations);
    }
}
