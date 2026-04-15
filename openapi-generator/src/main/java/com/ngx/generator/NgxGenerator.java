package com.ngx.generator;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.media.Schema;
import io.swagger.v3.oas.models.Operation;
import io.swagger.v3.oas.models.PathItem;
import io.swagger.v3.oas.models.Paths;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;

/**
 * Complete generator for TypeScript models and services.
 */
public class NgxGenerator {

    private final MustacheRenderer renderer;
    private String outputDir = "generated"; // Default output directory

    public NgxGenerator(MustacheRenderer renderer) {
        this.renderer = renderer;
    }

    /**
     * Sets the target directory for the generated files.
     */
    public void setOutputDir(String outputDir) {
        this.outputDir = outputDir;
    }

    // ------------------------
    // MODEL GENERATION
    // ------------------------
    public void generateModels(OpenAPI openApi) {
        ModelParser parser = new ModelParser(openApi);
        List<ModelParser.ClassModel> classes = parser.generateClasses();

        for (ModelParser.ClassModel clazz : classes) {
            Map<String, Object> context = new HashMap<>();
            context.put("classname", clazz.name);

            if (clazz.parent != null) {
                context.put("parent", clazz.parent);
                clazz.imports.add(clazz.parent);
            }

            List<Map<String, String>> tsImports = clazz.imports.stream()
                    .filter(name -> !name.equals(clazz.name))
                    .map(name -> Map.of("importClass", name))
                    .toList();
            context.put("tsImports", tsImports);

            List<Map<String, Object>> vars = new ArrayList<>();
            for (ModelParser.Property prop : clazz.properties) {
                Map<String, Object> v = new HashMap<>();
                v.put("name", prop.name);
                v.put("required", prop.required);
                v.put("dataType", parser.generateTypeScriptType(prop.type, prop.nullable));
                v.put("descriptor", parser.generateMetadataDescriptor(prop));
                vars.add(v);
            }
            context.put("vars", vars);

            String output = renderer.render("model.mustache", context);
            writeFile("models", clazz.name + ".ts", output);
        }
    }

    // ------------------------
    // SERVICE GENERATION
    // ------------------------
    public void generateServices(OpenAPI openApi) {
        Paths paths = openApi.getPaths();
        if (paths == null) return;

        for (Map.Entry<String, PathItem> pathEntry : paths.entrySet()) {
            String path = pathEntry.getKey();
            PathItem item = pathEntry.getValue();

            List<ServiceOperation> operations = new ArrayList<>();
            if (item.getGet() != null) operations.add(new ServiceOperation(item.getGet(), path, "GET"));
            if (item.getPost() != null) operations.add(new ServiceOperation(item.getPost(), path, "POST"));
            if (item.getPut() != null) operations.add(new ServiceOperation(item.getPut(), path, "PUT"));
            if (item.getDelete() != null) operations.add(new ServiceOperation(item.getDelete(), path, "DELETE"));

            if (operations.isEmpty()) continue;

            String serviceName = deriveServiceName(path);

            Map<String, Object> context = new HashMap<>();
            context.put("classname", serviceName);
            context.put("operations", operations);

            String output = renderer.render("service.mustache", context);
            writeFile("services", serviceName + ".ts", output);
        }
    }

    private String deriveServiceName(String path) {
        String[] parts = path.split("/");
        for (int i = parts.length - 1; i >= 0; i--) {
            if (!parts[i].isEmpty() && !parts[i].contains("{")) {
                return capitalize(parts[i]) + "Service";
            }
        }
        return "ApiService";
    }

    private String capitalize(String s) {
        return s.substring(0, 1).toUpperCase() + s.substring(1);
    }

    /**
     * Writes content to a file, ensuring subdirectories exist.
     * @param subDir e.g., "models" or "services"
     */
    private void writeFile(String subDir, String filename, String content) {
        try {
            Path directory = java.nio.file.Paths.get(outputDir, subDir);
            Files.createDirectories(directory);

            Path filePath = directory.resolve(filename);
            Files.writeString(filePath, content);

            System.out.println("Generated: " + filePath.toAbsolutePath());
        } catch (IOException e) {
            System.err.println("Error writing file " + filename + ": " + e.getMessage());
        }
    }

    // ------------------------
    // Helper classes
    // ------------------------

    public static class ServiceOperation {
        public String nickname;
        public String path;
        public String httpMethod;
        public List<ServiceParam> allParams = new ArrayList<>();
        public String description;

        public ServiceOperation(Operation op, String path, String httpMethod) {
            this.nickname = op.getOperationId() != null ? op.getOperationId() : "call";
            this.path = path;
            this.httpMethod = httpMethod;
            this.description = op.getDescription();

            if (op.getParameters() != null) {
                for (io.swagger.v3.oas.models.parameters.Parameter p : op.getParameters()) {
                    allParams.add(new ServiceParam(p));
                }
            }
            if (op.getRequestBody() != null) {
                allParams.add(new ServiceParam("body", "any", true));
            }
        }
    }

    public static class ServiceParam {
        public String paramName;
        public String dataType;
        public boolean required;

        public ServiceParam(io.swagger.v3.oas.models.parameters.Parameter p) {
            this.paramName = p.getName();
            this.dataType = "any"; // Ideally use a TypeMapper here
            this.required = Boolean.TRUE.equals(p.getRequired());
        }

        public ServiceParam(String name, String type, boolean required) {
            this.paramName = name;
            this.dataType = type;
            this.required = required;
        }
    }
}