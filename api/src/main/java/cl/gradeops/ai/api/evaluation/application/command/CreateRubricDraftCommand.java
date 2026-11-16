package cl.gradeops.ai.api.evaluation.application.command;

import cl.gradeops.ai.api.evaluation.application.model.RubricCriterion;

import java.math.BigDecimal;
import java.util.List;

public record CreateRubricDraftCommand(
        String title,
        BigDecimal totalPoints,
        List<RubricCriterion> criteria) {
}
