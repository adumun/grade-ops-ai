package cl.gradeops.ai.api.evaluation.infrastructure.adapter.out.zip;

import cl.gradeops.ai.api.evaluation.application.model.SubmissionCandidate;
import cl.gradeops.ai.api.evaluation.application.model.SubmissionFileEvidence;
import cl.gradeops.ai.api.evaluation.application.port.out.SubmissionArchiveIntakePort;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.ByteBuffer;
import java.nio.charset.CharacterCodingException;
import java.nio.charset.CodingErrorAction;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

/**
 * Reads a ZIP as a stream and extracts only bounded textual evidence. It never writes entries
 * to disk and never executes learner code. Unsafe paths, duplicate paths and resource-limit
 * violations reject the archive before any persistence takes place.
 */
public class ZipSubmissionIntake implements SubmissionArchiveIntakePort {

    private static final int DEFAULT_MAX_ENTRIES = 500;
    private static final long DEFAULT_MAX_UNCOMPRESSED_BYTES = 100L * 1024 * 1024;
    private static final int DEFAULT_MAX_FILE_BYTES = 512 * 1024;
    private static final Set<String> TEXT_EXTENSIONS = Set.of(
            "java", "kt", "kts", "py", "js", "jsx", "ts", "tsx", "html", "css", "scss",
            "json", "xml", "yml", "yaml", "md", "txt", "sql", "properties", "gradle",
            "sh", "c", "h", "cpp", "hpp", "cs", "php", "go", "rs", "vue", "svelte",
            "toml", "ini", "env", "gitignore");

    private final int maxEntries;
    private final long maxUncompressedBytes;
    private final int maxFileBytes;

    public ZipSubmissionIntake(int maxEntries, long maxUncompressedBytes, int maxFileBytes) {
        this.maxEntries = maxEntries > 0 ? maxEntries : DEFAULT_MAX_ENTRIES;
        this.maxUncompressedBytes = maxUncompressedBytes > 0
                ? maxUncompressedBytes : DEFAULT_MAX_UNCOMPRESSED_BYTES;
        this.maxFileBytes = maxFileBytes > 0 ? maxFileBytes : DEFAULT_MAX_FILE_BYTES;
    }

    @Override
    public List<SubmissionCandidate> read(InputStream archive) {
        Map<String, List<SubmissionFileEvidence>> grouped = new TreeMap<>();
        Map<String, Set<String>> seenPaths = new LinkedHashMap<>();
        long totalUncompressed = 0;
        int entryCount = 0;

        try (ZipInputStream zip = new ZipInputStream(archive, StandardCharsets.UTF_8)) {
            ZipEntry entry;
            while ((entry = zip.getNextEntry()) != null) {
                if (entry.isDirectory()) {
                    zip.closeEntry();
                    continue;
                }
                if (++entryCount > maxEntries) {
                    throw new IllegalArgumentException("ZIP exceeds the maximum number of files");
                }

                String normalizedPath = normalizeEntryPath(entry.getName());
                GroupedPath groupedPath = groupPath(normalizedPath);
                Set<String> groupPaths = seenPaths.computeIfAbsent(groupedPath.sourceDirectory(), ignored -> new HashSet<>());
                if (!groupPaths.add(groupedPath.relativePath())) {
                    throw new IllegalArgumentException("ZIP contains duplicate file paths");
                }

                MessageDigest digest = sha256();
                ByteArrayOutputStream captured = new ByteArrayOutputStream();
                long entryBytes = 0;
                boolean oversized = false;
                byte[] buffer = new byte[8192];
                int read;
                while ((read = zip.read(buffer)) != -1) {
                    entryBytes += read;
                    totalUncompressed += read;
                    if (totalUncompressed > maxUncompressedBytes) {
                        throw new IllegalArgumentException("ZIP exceeds the maximum uncompressed size");
                    }
                    digest.update(buffer, 0, read);
                    if (!oversized && entryBytes <= maxFileBytes) {
                        captured.write(buffer, 0, read);
                    } else {
                        oversized = true;
                        captured.reset();
                    }
                }
                zip.closeEntry();

                byte[] bytes = oversized ? new byte[0] : captured.toByteArray();
                String extension = extensionOf(groupedPath.relativePath());
                String classification;
                String extractedText = null;
                if (oversized) {
                    classification = "OVERSIZED";
                } else if (!TEXT_EXTENSIONS.contains(extension)) {
                    classification = isKnownBinary(extension) ? "BINARY" : "UNSUPPORTED";
                } else {
                    try {
                        if (containsNullByte(bytes)) {
                            classification = "BINARY";
                        } else {
                            extractedText = StandardCharsets.UTF_8.newDecoder()
                                    .onMalformedInput(CodingErrorAction.REPORT)
                                    .onUnmappableCharacter(CodingErrorAction.REPORT)
                                    .decode(ByteBuffer.wrap(bytes))
                                    .toString();
                            classification = "TEXT";
                        }
                    } catch (CharacterCodingException exception) {
                        classification = "BINARY";
                    }
                }

                String mediaType = mediaTypeFor(extension, classification);
                grouped.computeIfAbsent(groupedPath.sourceDirectory(), ignored -> new ArrayList<>())
                        .add(new SubmissionFileEvidence(
                                groupedPath.relativePath(),
                                mediaType,
                                entryBytes,
                                HexFormat.of().formatHex(digest.digest()),
                                classification,
                                extractedText));
            }
        } catch (IOException exception) {
            throw new IllegalArgumentException("The uploaded file is not a valid readable ZIP archive", exception);
        }

        if (grouped.isEmpty()) {
            throw new IllegalArgumentException("The ZIP archive contains no files");
        }

        List<String> projectDirectories = grouped.keySet().stream()
                .filter(key -> !key.equals("__single__"))
                .toList();
        if (projectDirectories.size() == 1 && grouped.containsKey("__single__")) {
            String projectDirectory = projectDirectories.getFirst();
            List<SubmissionFileEvidence> merged = new ArrayList<>(grouped.get(projectDirectory));
            merged.addAll(grouped.get("__single__"));
            grouped.clear();
            grouped.put("__single__", merged);
        } else if (projectDirectories.size() > 1 && grouped.containsKey("__single__")) {
            List<SubmissionFileEvidence> sharedFiles = grouped.remove("__single__");
            for (String projectDirectory : projectDirectories) {
                List<SubmissionFileEvidence> projectFiles = new ArrayList<>(grouped.get(projectDirectory));
                sharedFiles.stream()
                        .map(file -> new SubmissionFileEvidence(
                                "__shared__/" + file.path(), file.mediaType(), file.sizeBytes(),
                                file.sha256(), file.classification(), file.extractedText()))
                        .forEach(projectFiles::add);
                grouped.put(projectDirectory, projectFiles);
            }
        }

        if (projectDirectories.isEmpty() && grouped.containsKey("__single__")) {
            return List.of(new SubmissionCandidate("Entrega única", "__single__", grouped.get("__single__")));
        }
        return grouped.entrySet().stream()
                .map(entry -> new SubmissionCandidate(entry.getKey(), entry.getKey(), entry.getValue()))
                .toList();
    }

    private static String normalizeEntryPath(String rawPath) {
        if (rawPath == null || rawPath.isBlank()) {
            throw new IllegalArgumentException("ZIP contains an empty file path");
        }
        String path = rawPath.replace('\\', '/');
        if (path.startsWith("/") || path.matches("^[A-Za-z]:.*")) {
            throw new IllegalArgumentException("ZIP contains an absolute file path");
        }

        List<String> segments = new ArrayList<>();
        for (String segment : path.split("/")) {
            if (segment.isBlank()) {
                continue;
            }
            if (segment.equals(".") || segment.equals("..")) {
                throw new IllegalArgumentException("ZIP contains an unsafe relative file path");
            }
            if (segment.indexOf(0) >= 0) {
                throw new IllegalArgumentException("ZIP contains an invalid file path");
            }
            segments.add(segment);
        }
        if (segments.isEmpty()) {
            throw new IllegalArgumentException("ZIP contains an empty normalized file path");
        }
        return String.join("/", segments);
    }

    private static GroupedPath groupPath(String path) {
        int separator = path.indexOf('/');
        if (separator < 0) {
            return new GroupedPath("__single__", path);
        }
        String root = path.substring(0, separator);
        String relative = path.substring(separator + 1);
        if (relative.isBlank()) {
            throw new IllegalArgumentException("ZIP contains an invalid top-level file path");
        }
        return new GroupedPath(root, relative);
    }

    private static String extensionOf(String path) {
        int dot = path.lastIndexOf('.');
        int slash = path.lastIndexOf('/');
        return dot <= slash || dot == path.length() - 1
                ? "" : path.substring(dot + 1).toLowerCase();
    }

    private static boolean containsNullByte(byte[] bytes) {
        for (byte value : bytes) {
            if (value == 0) {
                return true;
            }
        }
        return false;
    }

    private static boolean isKnownBinary(String extension) {
        return Set.of("png", "jpg", "jpeg", "gif", "webp", "pdf", "zip", "jar", "class",
                "exe", "dll", "so", "bin", "mp3", "mp4", "woff", "woff2", "ttf", "ico")
                .contains(extension);
    }

    private static String mediaTypeFor(String extension, String classification) {
        return switch (extension) {
            case "java", "kt", "kts", "c", "h", "cpp", "hpp", "cs", "go", "rs" -> "text/x-source";
            case "js", "jsx", "ts", "tsx" -> "text/javascript";
            case "html" -> "text/html";
            case "css", "scss" -> "text/css";
            case "json" -> "application/json";
            case "xml" -> "application/xml";
            case "yml", "yaml" -> "application/yaml";
            case "md", "txt" -> "text/plain";
            case "sql" -> "application/sql";
            case "pdf" -> "application/pdf";
            case "png" -> "image/png";
            case "jpg", "jpeg" -> "image/jpeg";
            case "zip" -> "application/zip";
            default -> classification.equals("TEXT") ? "text/plain" : "application/octet-stream";
        };
    }

    private static MessageDigest sha256() {
        try {
            return MessageDigest.getInstance("SHA-256");
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }

    private record GroupedPath(String sourceDirectory, String relativePath) {
    }
}
