package cl.gradeops.ai.agents.shared.application.port.out;

import java.util.Map;

public class StructuredGenerationPortSelector {

    private final Map<String, StructuredGenerationPort> portsByProvider;
    private final String defaultProvider;

    public StructuredGenerationPortSelector(
            Map<String, StructuredGenerationPort> portsByProvider, String defaultProvider) {
        this.portsByProvider = Map.copyOf(portsByProvider);
        this.defaultProvider = defaultProvider;
    }

    public boolean supports(String provider) {
        return provider == null || portsByProvider.containsKey(provider);
    }

    public SelectedProvider resolve(String requestedProvider) {
        String name = requestedProvider == null ? defaultProvider : requestedProvider;
        StructuredGenerationPort port = portsByProvider.get(name);
        if (port == null) {
            throw new IllegalStateException("No structured generation adapter registered for provider: " + name);
        }
        return new SelectedProvider(name, port);
    }

    public record SelectedProvider(String name, StructuredGenerationPort port) {
    }
}
