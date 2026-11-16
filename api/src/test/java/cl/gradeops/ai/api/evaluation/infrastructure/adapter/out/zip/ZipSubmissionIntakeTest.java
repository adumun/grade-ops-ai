package cl.gradeops.ai.api.evaluation.infrastructure.adapter.out.zip;

import cl.gradeops.ai.api.evaluation.application.model.SubmissionCandidate;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ZipSubmissionIntakeTest {

    @Test
    void groupsTopLevelLearnerFoldersAndAttachesSharedReadme() throws Exception {
        byte[] archive = zip(Map.of(
                "student-a/src/Main.java", "class Main {}".getBytes(StandardCharsets.UTF_8),
                "student-b/app.py", "print('hello')".getBytes(StandardCharsets.UTF_8),
                "README.md", "Assignment instructions".getBytes(StandardCharsets.UTF_8)));

        List<SubmissionCandidate> submissions = intake().read(new ByteArrayInputStream(archive));

        assertThat(submissions).hasSize(2);
        assertThat(submissions).extracting(SubmissionCandidate::learnerLabel)
                .containsExactly("student-a", "student-b");
        assertThat(submissions.getFirst().files())
                .extracting(file -> file.path())
                .contains("src/Main.java", "__shared__/README.md");
        assertThat(submissions.getFirst().files())
                .filteredOn(file -> file.path().equals("src/Main.java"))
                .singleElement()
                .satisfies(file -> {
                    assertThat(file.classification()).isEqualTo("TEXT");
                    assertThat(file.extractedText()).isEqualTo("class Main {}");
                });
    }

    @Test
    void groupsRootProjectFilesAndNestedSourceAsOneSubmission() throws Exception {
        byte[] archive = zip(Map.of(
                "pom.xml", "<project/>".getBytes(StandardCharsets.UTF_8),
                "src/main/java/Main.java", "class Main {}".getBytes(StandardCharsets.UTF_8),
                "README.md", "Project".getBytes(StandardCharsets.UTF_8)));

        List<SubmissionCandidate> submissions = intake().read(new ByteArrayInputStream(archive));

        assertThat(submissions).hasSize(1);
        assertThat(submissions.getFirst().learnerLabel()).isEqualTo("Entrega única");
        assertThat(submissions.getFirst().files())
                .extracting(file -> file.path())
                .containsExactlyInAnyOrder("pom.xml", "main/java/Main.java", "README.md");
    }

    @Test
    void rejectsPathTraversalInsteadOfExtractingOutsideTheSubmission() throws Exception {
        byte[] archive = zip(Map.of("../outside.java", "unsafe".getBytes(StandardCharsets.UTF_8)));

        assertThatThrownBy(() -> intake().read(new ByteArrayInputStream(archive)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("unsafe relative file path");
    }

    @Test
    void classifiesBinaryAndOversizedFilesWithoutPersistingTheirContents() throws Exception {
        byte[] archive = zip(Map.of(
                "student/photo.png", new byte[]{0, 1, 2, 3},
                "student/large.java", "123456789".getBytes(StandardCharsets.UTF_8)));

        List<SubmissionCandidate> submissions = new ZipSubmissionIntake(10, 1024, 4)
                .read(new ByteArrayInputStream(archive));

        assertThat(submissions).hasSize(1);
        assertThat(submissions.getFirst().files())
                .filteredOn(file -> file.path().equals("photo.png"))
                .singleElement()
                .satisfies(file -> {
                    assertThat(file.classification()).isEqualTo("BINARY");
                    assertThat(file.extractedText()).isNull();
                });
        assertThat(submissions.getFirst().files())
                .filteredOn(file -> file.path().equals("large.java"))
                .singleElement()
                .satisfies(file -> {
                    assertThat(file.classification()).isEqualTo("OVERSIZED");
                    assertThat(file.extractedText()).isNull();
                });
    }

    @Test
    void rejectsArchivesThatExceedEntryOrExpansionLimits() throws Exception {
        byte[] archive = zip(Map.of(
                "student/a.java", "a".getBytes(StandardCharsets.UTF_8),
                "student/b.java", "b".getBytes(StandardCharsets.UTF_8)));

        assertThatThrownBy(() -> new ZipSubmissionIntake(1, 1024, 32)
                .read(new ByteArrayInputStream(archive)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("maximum number of files");

        assertThatThrownBy(() -> new ZipSubmissionIntake(10, 1, 32)
                .read(new ByteArrayInputStream(archive)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("maximum uncompressed size");
    }

    private static ZipSubmissionIntake intake() {
        return new ZipSubmissionIntake(500, 1024 * 1024, 512 * 1024);
    }

    private static byte[] zip(Map<String, byte[]> files) throws Exception {
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        try (ZipOutputStream zip = new ZipOutputStream(output)) {
            for (Map.Entry<String, byte[]> file : files.entrySet()) {
                zip.putNextEntry(new ZipEntry(file.getKey()));
                zip.write(file.getValue());
                zip.closeEntry();
            }
        }
        return output.toByteArray();
    }
}
