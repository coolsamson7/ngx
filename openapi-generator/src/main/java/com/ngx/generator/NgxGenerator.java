package com.ngx.generator;

import io.swagger.v3.oas.models.OpenAPI;
import java.nio.file.*;
import java.util.*;

public class NgxGenerator {
    private final MustacheRenderer renderer;
    private String outputDir = "generated";

    public NgxGenerator(MustacheRenderer renderer) {
        this.renderer = renderer;
    }

    public void setOutputDir(String outputDir) { this.outputDir = outputDir; }

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

    public void generateServices(OpenAPI openApi) {
        ModelParser modelParser = new ModelParser(openApi);
        ServiceParser serviceParser = new ServiceParser(modelParser);
        List<ServiceParser.ServiceGroup> groups = serviceParser.parse(openApi);

        for (var group : groups) {
            Map<String, Object> context = new HashMap<>();
            context.put("classname", group.name());
            context.put("operations", group.operations());
            context.put("tsImports", group.imports().stream().map(i -> Map.of("importClass", i)).toList());

            String output = renderer.render("service.mustache", context);
            writeFile("services", group.name() + ".ts", output);
        }
    }

    private void writeFile(String subDir, String filename, String content) {
        // Clean up indentation and trailing commas
        String clean = content.replaceAll("(?m)^[ \t]+$", "") // Empty lines
                .replaceAll("\n\n\n+", "\n\n")  // Max 2 newlines
                .replaceAll(",\\s*\\)", ")");   // Trailing comma fix
        try {
            Path path = Paths.get(outputDir, subDir);
            Files.createDirectories(path);
            Files.writeString(path.resolve(filename), clean.trim());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}