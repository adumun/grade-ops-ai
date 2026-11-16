package cl.gradeops.ai.agents.grading.application.port.in;

import cl.gradeops.ai.agents.grading.application.command.GradingCommand;
import cl.gradeops.ai.agents.grading.application.result.GradingExecutionOutcome;

public interface GradeSubmissionUseCase {
    GradingExecutionOutcome execute(GradingCommand command);
}
