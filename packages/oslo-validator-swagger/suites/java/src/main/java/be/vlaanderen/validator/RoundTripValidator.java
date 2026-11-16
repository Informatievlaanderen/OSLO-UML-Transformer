package be.vlaanderen.validator;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import jakarta.validation.Validation;
import org.openapitools.jackson.nullable.JsonNullableModule;

import java.io.File;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

/**
 * Validates OpenAPI-generated model classes by performing a round-trip:
 * deserialize example JSON → JSR-303 validate → re-serialize → compare.
 * <p>
 * Usage:
 *   --root-model=be.vlaanderen.validator.model.PersonEnvelope
 *   --examples=/spec/example1.json,/spec/example2.json
 */
public class RoundTripValidator {

    public static void main(String[] args) throws Exception {
        String rootModel = null;
        List<String> exampleFiles = new ArrayList<>();

        for (String arg : args) {
            if (arg.startsWith("--root-model=")) {
                rootModel = arg.substring("--root-model=".length());
            } else if (arg.startsWith("--examples=")) {
                String examples = arg.substring("--examples=".length());
                for (String ex : examples.split(",")) {
                    String trimmed = ex.trim();
                    if (!trimmed.isEmpty()) {
                        exampleFiles.add(trimmed);
                    }
                }
            }
        }

        if (rootModel == null || rootModel.isEmpty()) {
            System.out.println("{\"passed\":true,\"message\":\"No --root-model specified, skipping round-trip validation\"}");
            return;
        }

        if (exampleFiles.isEmpty()) {
            System.out.println("{\"passed\":true,\"message\":\"No --examples specified, skipping round-trip validation\"}");
            return;
        }

        ObjectMapper objectMapper = new ObjectMapper()
                .registerModule(new JavaTimeModule())
                .registerModule(new JsonNullableModule())
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        Validator validator = factory.getValidator();

        Class<?> modelClass = Class.forName(rootModel);

        List<String> allFailures = new ArrayList<>();

        for (int i = 0; i < exampleFiles.size(); i++) {
            String examplePath = exampleFiles.get(i);
            File exampleFile = new File(examplePath);
            System.err.println("[" + (i + 1) + "/" + exampleFiles.size() + "] Testing: " + exampleFile.getName());

            if (!exampleFile.exists()) {
                System.err.println("  ✗ File not found: " + examplePath);
                allFailures.add("Example file not found: " + examplePath);
                continue;
            }

            JsonNode inputJson = objectMapper.readTree(exampleFile);

            // Deserialize into the generated model class
            Object model = objectMapper.treeToValue(inputJson, modelClass);

            // JSR-303 bean validation
            @SuppressWarnings("unchecked")
            Set<ConstraintViolation<Object>> violations = (Set) validator.validate(model);
            if (!violations.isEmpty()) {
                System.err.println("  ✗ Validation failed (" + violations.size() + " constraint(s))");
                for (ConstraintViolation<Object> v : violations) {
                    String msg = exampleFile.getName() + " [validation] " + v.getPropertyPath() + ": " + v.getMessage();
                    allFailures.add(msg);
                    System.err.println("    - " + v.getPropertyPath() + ": " + v.getMessage());
                }
            }

            // Re-serialize to JSON tree
            JsonNode outputJson = objectMapper.valueToTree(model);

            // Compare input vs output for data loss
            List<String> missing = findMissingFields(inputJson, outputJson, "");
            if (!missing.isEmpty()) {
                System.err.println("  ✗ Round-trip data loss (" + missing.size() + " field(s))");
                allFailures.add("Round-trip data loss in " + exampleFile.getName() + ":");
                for (String m : missing) {
                    allFailures.add(m);
                    System.err.println("    - " + m);
                }
            }

            if (violations.isEmpty() && missing.isEmpty()) {
                System.err.println("  ✓ Passed");
            }
        }

        if (allFailures.isEmpty()) {
            System.out.println("{\"passed\":true}");
        } else {
            // Build a JSON-safe message
            StringBuilder sb = new StringBuilder();
            sb.append("{\"passed\":false,\"message\":\"");
            for (int i = 0; i < allFailures.size(); i++) {
                if (i > 0) {
                    sb.append("\\n");
                }
                sb.append(escapeJson(allFailures.get(i)));
            }
            sb.append("\"}");
            System.out.println(sb.toString());
            System.exit(1);
        }
    }

    private static List<String> findMissingFields(JsonNode input, JsonNode output, String path) {
        List<String> missing = new ArrayList<>();
        if (input.isObject()) {
            input.fields().forEachRemaining(entry -> {
                String fieldPath = path.isEmpty() ? entry.getKey() : path + "." + entry.getKey();
                if (!output.has(entry.getKey())) {
                    missing.add(fieldPath + " (missing entirely)");
                } else {
                    missing.addAll(findMissingFields(entry.getValue(), output.get(entry.getKey()), fieldPath));
                }
            });
        } else if (input.isArray() && output.isArray()) {
            for (int i = 0; i < input.size(); i++) {
                if (i < output.size()) {
                    missing.addAll(findMissingFields(input.get(i), output.get(i), path + "[" + i + "]"));
                } else {
                    missing.add(path + "[" + i + "] (missing in output)");
                }
            }
        } else if (!input.equals(output)) {
            missing.add(path + " (value differs: input=" + input + ", output=" + output + ")");
        }
        return missing;
    }

    private static String escapeJson(String s) {
        return s.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }
}