package cl.gradeops.ai.agents.assessment.infrastructure.adapter.out.gemini;

import cl.gradeops.ai.agents.assessment.application.port.out.AssessmentGenerationPort;
import cl.gradeops.ai.agents.assessment.application.port.out.AssessmentGenerationResponse;
import cl.gradeops.ai.agents.shared.application.port.out.StructuredGenerationPort;
import cl.gradeops.ai.agents.shared.application.port.out.StructuredGenerationResponse;
import cl.gradeops.ai.agents.assessment.application.result.AssessmentResult;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.ResponseEntity;
import org.springframework.ai.chat.metadata.EmptyUsage;
import org.springframework.ai.chat.metadata.Usage;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.google.genai.GoogleGenAiChatOptions;

/**
 * The only class in this feature allowed to import {@code ChatClient}/{@code ChatResponse},
 * per the project's package conventions for provider-specific adapters. Isolates
 * {@code AssessmentAgentOrchestrator} from Spring AI entirely.
 *
 * <p>Uses {@code ChatClient.CallResponseSpec.responseEntity(Class)} rather than {@code
 * entity(Class)} so both the mapped {@link AssessmentResult} and the raw {@link ChatResponse}
 * (for token-usage metadata) come from a single call — calling {@code entity(...)} and {@code
 * chatResponse()} separately would issue two model calls.
 *
 * <p>{@code ChatResponseMetadata.getUsage()} never actually returns {@code null} — Spring AI
 * defaults it to {@link EmptyUsage}, whose token counts are {@code 0}, not absent. Treating
 * only a literal {@code null} as "no usage data" would silently report {@code 0} tokens
 * whenever a provider doesn't supply usage metadata, instead of the {@code null} this class's
 * contract promises for that case — checking for {@code EmptyUsage} explicitly is what makes
 * "unavailable" distinguishable from "zero".
 */
@RequiredArgsConstructor
public class GeminiAssessmentGenerationAdapter implements AssessmentGenerationPort, StructuredGenerationPort {

    private final ChatClient chatClient;

    @Override
    public AssessmentGenerationResponse generate(String renderedPrompt, String model) {
        StructuredGenerationResponse<AssessmentResult> response =
                generate(renderedPrompt, model, AssessmentResult.class);
        return AssessmentGenerationResponse.builder()
                .result(response.result())
                .rawResponseText(response.rawResponseText())
                .modelName(response.modelName())
                .estimatedInputTokens(response.estimatedInputTokens())
                .estimatedOutputTokens(response.estimatedOutputTokens())
                .build();
    }

    @Override
    public <T> StructuredGenerationResponse<T> generate(
            String renderedPrompt, String model, Class<T> responseType) {
        ChatClient.ChatClientRequestSpec requestSpec = chatClient.prompt(renderedPrompt);
        if (model != null) {
            requestSpec = requestSpec.options(GoogleGenAiChatOptions.builder().model(model).build());
        }
        ResponseEntity<ChatResponse, T> responseEntity =
                requestSpec.call().responseEntity(responseType);

        ChatResponse chatResponse = responseEntity.response();
        Usage usage = chatResponse.getMetadata() != null ? chatResponse.getMetadata().getUsage() : null;
        boolean usageAvailable = usage != null && !(usage instanceof EmptyUsage);

        return new StructuredGenerationResponse<>(
                responseEntity.entity(),
                chatResponse.getResult().getOutput().getText(),
                chatResponse.getMetadata() != null ? chatResponse.getMetadata().getModel() : null,
                usageAvailable ? usage.getPromptTokens() : null,
                usageAvailable ? usage.getCompletionTokens() : null);
    }
}
