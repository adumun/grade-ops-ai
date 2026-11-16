package cl.gradeops.ai.api.assessment.application.usecase;

import java.time.Duration;

/**
 * Read-side heuristic for detecting operations that stopped making progress.
 * This is not a provider timeout; it only determines when an in-flight operation
 * should be presented as indeterminate and made eligible for explicit retry.
 */
final class AiOperationTiming {
    static final Duration INDETERMINATE_AFTER = Duration.ofMinutes(5);

    private AiOperationTiming() {
    }
}
