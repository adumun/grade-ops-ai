package cl.gradeops.ai.agents.shared.application.port.out;

public interface StructuredGenerationPort {
    <T> StructuredGenerationResponse<T> generate(String renderedPrompt, String model, Class<T> responseType);
}
