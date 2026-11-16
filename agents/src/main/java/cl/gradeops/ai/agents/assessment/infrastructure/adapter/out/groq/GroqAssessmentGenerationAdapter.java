package cl.gradeops.ai.agents.assessment.infrastructure.adapter.out.groq;

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
import org.springframework.ai.openai.OpenAiChatOptions;

/**
 * Groq's {@code AssessmentGenerationPort} implementation. Groq exposes an OpenAI-compatible
 * chat completions endpoint, so this adapter is built on Spring AI's OpenAI {@code ChatClient}
 * pointed at Groq's base URL — there is no dedicated Groq starter. Structurally mirrors {@code
 * GeminiAssessmentGenerationAdapter}: same one-call {@code responseEntity} usage and the same
 * {@code EmptyUsage} handling (Spring AI's usage metadata is never a literal {@code null}, it
 * defaults to a zero-valued marker type when a provider omits usage data).
 */
@RequiredArgsConstructor
public class GroqAssessmentGenerationAdapter implements AssessmentGenerationPort, StructuredGenerationPort {

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
            requestSpec = requestSpec.options(OpenAiChatOptions.builder().model(model).build());
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
