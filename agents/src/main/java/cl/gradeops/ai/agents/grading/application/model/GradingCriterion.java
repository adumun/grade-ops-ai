package cl.gradeops.ai.agents.grading.application.model;

import java.math.BigDecimal;
import java.util.List;

public record GradingCriterion(
        String id,
        String name,
        String description,
        BigDecimal maxPoints,
        List<String> evidenceExpectations) {
}
