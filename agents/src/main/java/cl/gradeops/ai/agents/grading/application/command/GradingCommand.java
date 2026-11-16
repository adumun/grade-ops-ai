package cl.gradeops.ai.agents.grading.application.command;

import cl.gradeops.ai.agents.grading.application.model.GradingCriterion;
import cl.gradeops.ai.agents.grading.application.model.SubmissionFile;

import java.math.BigDecimal;
import java.util.List;

public record GradingCommand(
        String assessmentTitle,
        String context,
        String instructions,
        List<String> objectives,
        BigDecimal totalPoints,
        List<GradingCriterion> criteria,
        List<SubmissionFile> files,
        List<String> omittedFilePaths,
        boolean evidenceTruncated,
        String provider,
        String model) {
}
