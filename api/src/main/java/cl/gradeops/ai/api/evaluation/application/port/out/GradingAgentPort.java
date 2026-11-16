package cl.gradeops.ai.api.evaluation.application.port.out;

import cl.gradeops.ai.api.evaluation.application.model.GradingAgentResult;
import cl.gradeops.ai.api.evaluation.application.model.GradingContext;

public interface GradingAgentPort {
    GradingAgentResult grade(GradingContext context);
}
