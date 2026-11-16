package cl.gradeops.ai.agents.grading.application.usecase;

import cl.gradeops.ai.agents.grading.application.command.GradingCommand;
import cl.gradeops.ai.agents.grading.application.orchestrator.GradingAgentOrchestrator;
import cl.gradeops.ai.agents.grading.application.port.in.GradeSubmissionUseCase;
import cl.gradeops.ai.agents.grading.application.result.GradingExecutionOutcome;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class GradeSubmissionHandler implements GradeSubmissionUseCase {

    private final GradingAgentOrchestrator orchestrator;

    @Override
    public GradingExecutionOutcome execute(GradingCommand command) {
        return orchestrator.grade(command);
    }
}
