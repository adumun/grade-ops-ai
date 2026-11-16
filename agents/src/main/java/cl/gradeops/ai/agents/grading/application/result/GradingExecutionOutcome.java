package cl.gradeops.ai.agents.grading.application.result;

import cl.gradeops.ai.agents.assessment.application.result.AgentExecutionLogPayload;

public record GradingExecutionOutcome(GradingResult result, AgentExecutionLogPayload log) {
}
