package cl.gradeops.ai.api.evaluation.application.exception;

import cl.gradeops.ai.api.evaluation.application.model.GradingExecutionMetadata;

public class GradingAgentPortException extends RuntimeException {

    private final GradingExecutionMetadata execution;

    public GradingAgentPortException(String message, Throwable cause, GradingExecutionMetadata execution) {
        super(message, cause);
        this.execution = execution;
    }

    public GradingExecutionMetadata execution() {
        return execution;
    }
}
