package cl.gradeops.ai.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * The only backend bootstrap. The AI capability module is included in this application
 * context; it does not start a second server or own domain persistence.
 */
@SpringBootApplication(scanBasePackages = {
        "cl.gradeops.ai.api",
        "cl.gradeops.ai.agents.assessment.application",
        "cl.gradeops.ai.agents.assessment.infrastructure.adapter.out",
        "cl.gradeops.ai.agents.assessment.infrastructure.config"
})
public class GradeOpsApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(GradeOpsApiApplication.class, args);
    }
}
