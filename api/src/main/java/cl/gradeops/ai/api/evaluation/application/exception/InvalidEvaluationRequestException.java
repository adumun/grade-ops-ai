package cl.gradeops.ai.api.evaluation.application.exception;

public class InvalidEvaluationRequestException extends RuntimeException {
    public InvalidEvaluationRequestException(String message) {
        super(message);
    }

    public InvalidEvaluationRequestException(String message, Throwable cause) {
        super(message, cause);
    }
}
