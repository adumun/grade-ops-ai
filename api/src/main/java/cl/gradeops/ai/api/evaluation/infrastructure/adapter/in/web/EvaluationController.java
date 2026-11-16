package cl.gradeops.ai.api.evaluation.infrastructure.adapter.in.web;

import cl.gradeops.ai.api.evaluation.application.command.CreateRubricDraftCommand;
import cl.gradeops.ai.api.evaluation.application.model.RubricCriterion;
import cl.gradeops.ai.api.evaluation.application.usecase.EvaluationService;
import cl.gradeops.ai.api.evaluation.infrastructure.adapter.in.web.request.CreateRubricRequest;
import cl.gradeops.ai.api.shared.infrastructure.config.security.AuthenticatedTeacher;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class EvaluationController {

    private final EvaluationService evaluationService;

    @PostMapping("/assessments/{assessmentId}/rubrics")
    @ResponseStatus(HttpStatus.CREATED)
    public Object createRubric(
            @PathVariable UUID assessmentId,
            @AuthenticationPrincipal AuthenticatedTeacher teacher,
            @Valid @RequestBody CreateRubricRequest request) {
        List<RubricCriterion> criteria = request.criteria().stream()
                .map(criterion -> new RubricCriterion(
                        UUID.randomUUID().toString(),
                        criterion.name(),
                        criterion.description(),
                        criterion.maxPoints(),
                        criterion.evidenceExpectations()))
                .toList();
        return evaluationService.createRubricDraft(
                assessmentId,
                teacher.uid(),
                new CreateRubricDraftCommand(request.title(), request.totalPoints(), criteria));
    }

    @GetMapping("/assessments/{assessmentId}/rubrics")
    public Object listRubrics(
            @PathVariable UUID assessmentId,
            @AuthenticationPrincipal AuthenticatedTeacher teacher) {
        return evaluationService.listRubrics(assessmentId, teacher.uid());
    }

    @PostMapping("/assessments/{assessmentId}/rubrics/{rubricId}/approve")
    public Object approveRubric(
            @PathVariable UUID assessmentId,
            @PathVariable UUID rubricId,
            @AuthenticationPrincipal AuthenticatedTeacher teacher) {
        return evaluationService.approveRubric(assessmentId, rubricId, teacher.uid());
    }

    @PostMapping(path = "/assessments/{assessmentId}/submission-batches",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public Object uploadSubmissions(
            @PathVariable UUID assessmentId,
            @AuthenticationPrincipal AuthenticatedTeacher teacher,
            @RequestPart("file") MultipartFile file) throws IOException {
        return evaluationService.uploadSubmissions(
                assessmentId,
                teacher.uid(),
                file.getOriginalFilename(),
                file.getSize(),
                file.getInputStream());
    }

    @GetMapping("/submission-batches/{batchId}")
    public Object getSubmissionBatch(
            @PathVariable UUID batchId,
            @AuthenticationPrincipal AuthenticatedTeacher teacher) {
        return evaluationService.getSubmissionBatch(batchId, teacher.uid());
    }

    @GetMapping("/submissions/{submissionId}/evidence")
    public Object getSubmissionEvidence(
            @PathVariable UUID submissionId,
            @AuthenticationPrincipal AuthenticatedTeacher teacher) {
        return evaluationService.getSubmissionEvidence(submissionId, teacher.uid());
    }
}
