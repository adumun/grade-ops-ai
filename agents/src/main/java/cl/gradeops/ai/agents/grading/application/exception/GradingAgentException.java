package cl.gradeops.ai.agents.grading.application.exception;

import cl.gradeops.ai.agents.assessment.application.result.AgentExecutionLogPayload;

public class GradingAgentException extends RuntimeException {

    private final Reason reason;
    private final AgentExecutionLogPayload log;

    public GradingAgentException(Reason reason, String message, AgentExecutionLogPayload log) {
        super(message);
        this.reason = reason;
        this.log = log;
    }

    public GradingAgentException(Reason reason, String message, Throwable cause, AgentExecutionLogPayload log) {
        super(message, cause);
        this.reason = reason;
        this.log = log;
    }

    public Reason reason() {
        return reason;
    }

    public AgentExecutionLogPayload log() {
        return log;
    }

    public enum Reason {
        INVALID_COMMAND,
        PROVIDER_FAILURE,
        MALFORMED_OUTPUT
    }
}
