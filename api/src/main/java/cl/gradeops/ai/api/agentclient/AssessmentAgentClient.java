package cl.gradeops.ai.api.agentclient;

import cl.gradeops.ai.agents.assessment.application.exception.AssessmentAgentException;
import cl.gradeops.ai.agents.assessment.application.port.in.GenerateAssessmentDraftUseCase;
import cl.gradeops.ai.agents.assessment.application.result.AgentExecutionLogPayload;
import cl.gradeops.ai.agents.assessment.application.result.AssessmentExecutionOutcome;
import lombok.RequiredArgsConstructor;

/**
 * In-process adapter from the API's stable application contract to the Spring AI capability
 * module. The API remains responsible for durable operation state and persistence; this adapter
 * only translates typed commands/results and preserves the agent's structured failure evidence.
 */
@RequiredArgsConstructor
public class AssessmentAgentClient {

    private final GenerateAssessmentDraftUseCase generateAssessmentDraftUseCase;

    public AssessmentAgentResponse generate(AssessmentCommand command, String correlationId) {
        try {
            var agentCommand = cl.gradeops.ai.agents.assessment.application.command.AssessmentCommand.builder()
                    .learningGoal(command.learningGoal())
                    .topic(command.topic())
                    .level(command.level())
                    .duration(command.duration())
                    .language(command.language())
                    .adjustmentNotes(command.adjustmentNotes())
                    .previousDraftId(command.previousDraftId())
                    .previousDraft(command.previousDraft())
                    .provider(command.provider())
                    .model(command.model())
                    .build();

            AssessmentExecutionOutcome outcome = generateAssessmentDraftUseCase.execute(agentCommand);
            return new AssessmentAgentResponse(
                    new AssessmentAgentResponse.Result(
                            outcome.result().title(),
                            outcome.result().context(),
                            outcome.result().instructions(),
                            outcome.result().objectives(),
                            outcome.result().deliverables(),
                            outcome.result().constraints()),
                    toLog(outcome.log()));
        } catch (AssessmentAgentException exception) {
            AssessmentAgentErrorPayload payload = new AssessmentAgentErrorPayload(
                    exception.reason().name(),
                    exception.getMessage(),
                    toLog(exception.log()),
                    correlationId);
            throw new AgentClientException(
                    AgentClientException.Reason.AGENT_REJECTED,
                    "In-process assessment agent rejected the operation (correlationId=" + correlationId + ")",
                    exception,
                    payload);
        } catch (RuntimeException exception) {
            throw new AgentClientException(
                    AgentClientException.Reason.AGENT_ERROR,
                    "In-process assessment agent failed (correlationId=" + correlationId + ")",
                    exception);
        }
    }

    private static AssessmentAgentResponse.Log toLog(AgentExecutionLogPayload log) {
        if (log == null) {
            return null;
        }
        return new AssessmentAgentResponse.Log(
                log.agentExecutionId(),
                log.agentName(),
                log.provider(),
                log.model(),
                log.promptVersion(),
                log.inputHash(),
                log.outputHash(),
                log.estimatedInputTokens(),
                log.estimatedOutputTokens(),
                log.costEstimate(),
                log.status(),
                log.errorCode(),
                log.startedAt(),
                log.finishedAt());
    }
}
