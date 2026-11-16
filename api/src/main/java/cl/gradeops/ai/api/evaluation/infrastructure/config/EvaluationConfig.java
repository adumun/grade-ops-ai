package cl.gradeops.ai.api.evaluation.infrastructure.config;

import cl.gradeops.ai.api.evaluation.application.port.out.EvaluationRepositoryPort;
import cl.gradeops.ai.api.evaluation.application.port.out.GradingAgentPort;
import cl.gradeops.ai.api.evaluation.infrastructure.adapter.out.ai.SpringAiGradingAgentAdapter;
import cl.gradeops.ai.agents.grading.application.port.in.GradeSubmissionUseCase;
import cl.gradeops.ai.api.evaluation.application.port.out.SubmissionArchiveIntakePort;
import cl.gradeops.ai.api.evaluation.application.usecase.EvaluationService;
import cl.gradeops.ai.api.evaluation.infrastructure.adapter.out.persistence.JdbcEvaluationRepositoryAdapter;
import cl.gradeops.ai.api.evaluation.infrastructure.adapter.out.zip.ZipSubmissionIntake;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import tools.jackson.databind.json.JsonMapper;

@Configuration
class EvaluationConfig {

    @Bean
    EvaluationRepositoryPort evaluationRepositoryPort(JdbcTemplate jdbc, JsonMapper jsonMapper) {
        return new JdbcEvaluationRepositoryAdapter(jdbc, jsonMapper);
    }

    @Bean
    SubmissionArchiveIntakePort submissionArchiveIntakePort(
            @Value("${app.submissions.max-entries:500}") int maxEntries,
            @Value("${app.submissions.max-uncompressed-bytes:104857600}") long maxUncompressedBytes,
            @Value("${app.submissions.max-file-bytes:524288}") int maxFileBytes) {
        return new ZipSubmissionIntake(maxEntries, maxUncompressedBytes, maxFileBytes);
    }

    @Bean
    @ConditionalOnBean(GradeSubmissionUseCase.class)
    GradingAgentPort gradingAgentPort(GradeSubmissionUseCase gradeSubmissionUseCase) {
        return new SpringAiGradingAgentAdapter(gradeSubmissionUseCase);
    }

    @Bean
    @ConditionalOnMissingBean(GradingAgentPort.class)
    GradingAgentPort disabledGradingAgentPort() {
        return context -> {
            throw new IllegalStateException("The grading agent is disabled for this application profile");
        };
    }

    @Bean
    EvaluationService evaluationService(
            EvaluationRepositoryPort repository,
            SubmissionArchiveIntakePort archiveIntake,
            GradingAgentPort gradingAgent,
            @Value("${app.submissions.max-archive-bytes:26214400}") long maxArchiveBytes) {
        return new EvaluationService(repository, archiveIntake, gradingAgent, maxArchiveBytes);
    }
}
