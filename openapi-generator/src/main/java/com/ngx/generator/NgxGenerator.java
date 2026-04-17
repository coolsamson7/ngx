package com.ngx.generator;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.parser.OpenAPIV3Parser;

import java.nio.file.*;
import java.util.*;

import static com.ngx.generator.FileNameStyle.KEBAB_CASE;

public class NgxGenerator {
    static final String VERSION = "1.0";
    static class Runner {

        String _input = "";
        String _outputDir = "generated";

        boolean _generateServices = true;
        boolean _generateModels = true;

        String _modelDir = "model";
        String _serviceDir = "service";

        boolean _generateIndex = true;

        String _domain = "";

        FileNameStyle _filenameStyle = KEBAB_CASE;

        // fluent

        Runner generateIndex(boolean generate) {
            this._generateIndex = generate;

            return this;
        }

        Runner filenameStyle(FileNameStyle _filenameStyle) {
            this._filenameStyle = _filenameStyle;

            return this;
        }

        Runner serviceDir(String serviceDir) {
            this._serviceDir = serviceDir;

            return this;
        }

        Runner domain(String domain) {
            this._domain = domain;

            return this;
        }

        Runner modelDir(String modelDir) {
            this._modelDir = modelDir;

            return this;
        }

        Runner input(String input) {
            this._input = input;

            return this;
        }

        Runner outputDir(String o) {
            this._outputDir = o;

            return this;
        }

        Runner generateServices(boolean generateServices) {
            this._generateServices = generateServices;

            return this;
        }

        Runner generateModels(boolean generateModels) {
            this._generateModels = generateModels;

            return this;
        }

        // go

        void run() {
            OpenAPI openApi = new OpenAPIV3Parser().read(this._input);
            if (openApi == null) {
                System.err.println("Failed to parse OpenAPI spec: " + _input);
                System.exit(1);
            }

            // log settings

            System.out.println("output dir        : " + this._outputDir);
            System.out.println("generate models   : " + this._generateModels);
            System.out.println("model directory   : " + this._modelDir);
            System.out.println("generate services : " + this._generateServices);
            System.out.println("service directory : " + this._serviceDir);
            System.out.println("generate index    : " + this._generateIndex);
            System.out.println("service domain    : " + this._domain);

            // Create our generator

            NgxGenerator generator = new NgxGenerator();

            generator.outputDir = this._outputDir;
            generator.filenameStyle = this._filenameStyle;
            generator.modelDir = this._modelDir;
            generator.serviceDir = this._serviceDir;
            generator.generateIndex = this._generateIndex;
            generator.domain = this._domain;

            if ( this._generateModels)
                generator.generateModels(openApi);

            if ( this._generateServices)
                generator.generateServices(openApi);
        }
    }

    static Runner runner() {
        return new Runner();
    }

    private final MustacheRenderer renderer;
    private String outputDir = "generated";

    FileNameStyle filenameStyle = KEBAB_CASE;
    String modelDir = "model";
    String serviceDir = "service";
    String domain = "";
    boolean generateIndex = true;

    public NgxGenerator() {
        this.renderer = new MustacheRenderer();;
    }

    private String toFileName(String name) {
        return switch (this.filenameStyle) {
            case PASCAL_CASE -> name;
            case KEBAB_CASE -> toKebabCase(name);
        };
    }

    private String toKebabCase(String s) {
        return s
                .replaceAll("([a-z])([A-Z])", "$1-$2")
                .replaceAll("_", "-")
                .toLowerCase();
    }

    public String generateIndex(List<String> exportedFiles) {
        StringBuilder sb = new StringBuilder();

        for (String file : exportedFiles) {
            String name = file
                    .replace(".ts", "")
                    .replace(".tsx", "");

            sb.append("export * from \"./")
                    .append(name)
                    .append("\";\n");
        }

        return sb.toString();
    }

    public void generateModels(OpenAPI openApi) {
        ModelParser parser = new ModelParser(openApi);
        List<ModelParser.ClassModel> classes = parser.generateClasses();

        List<String> files = new LinkedList<>();

        for (ModelParser.ClassModel clazz : classes) {
            Map<String, Object> context = new HashMap<>();
            context.put("classname", clazz.name);

            if (clazz.parent != null) {
                context.put("parent", clazz.parent);
                clazz.imports.add(clazz.parent);
            }

            List<Map<String, String>> tsImports = clazz.imports.stream()
                    .filter(name -> !name.equals(clazz.name))
                    .map(name -> Map.of(
                            "importClass", name,
                            "importFile", toFileName(name)))
                    .toList();
            context.put("tsImports", tsImports);
            context.put("domain", domain);
            context.put("version", VERSION);

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

            String file = toFileName(clazz.name) + ".ts";
            files.add(file);

            writeFile(this.modelDir, file, output);
        }

        if ( this.generateIndex) {
            String index = generateIndex(files);
            writeFile(this.modelDir, "index.ts", index);
        }
    }

    public void generateServices(OpenAPI openApi) {
        ModelParser modelParser = new ModelParser(openApi);
        ServiceParser serviceParser = new ServiceParser(modelParser);
        List<ServiceParser.ServiceGroup> groups = serviceParser.parse(openApi);

        List<String> files = new LinkedList<>();

        for (var group : groups) {
            Map<String, Object> context = new HashMap<>();
            context.put("classname", group.name());
            context.put("domain", this.domain);
            context.put("version", VERSION);
            context.put("operations", group.operations());
            context.put("tsImports",
                    group.imports().stream()
                            .map(name -> Map.of(
                                    "importClass", name,
                                    "importFile", "../" + this.modelDir + "/" + toFileName(name)))
                            .toList());

            String output = renderer.render("service.mustache", context);

            String file = toFileName(group.name()) + ".ts";

            files.add(file);

            writeFile(this.serviceDir, file, output);
        }

        if ( this.generateIndex) {
            String index = generateIndex(files);
            writeFile(this.modelDir, "index.ts", index);
        }
    }

    private void writeFile(String subDir, String filename, String content) {
        // Clean up indentation and trailing commas
        String clean = content.replaceAll("(?m)^[ \t]+$", "") // Empty lines
                .replaceAll("\n\n\n+", "\n\n")  // Max 2 newlines
                .replaceAll(",\\s*\\)", ")")
                .trim();

        try {
            Path dir = Paths.get(outputDir, subDir);
            Files.createDirectories(dir);

            Path file = dir.resolve(filename);

            boolean changed = true;

            // Compare with existing file if it exists
            if (Files.exists(file)) {
                String existing = Files.readString(file).trim();
                changed = !existing.equals(clean);
            }

            // Write only if needed (optional but usually desired)
            if (changed) {
                Files.writeString(file, clean);

                System.out.println("> updated " + file);
            } else {
                System.out.println("> unchanged " + file);
            }

        } catch (Exception e) {
            System.err.println("> failed " + filename);
            e.printStackTrace();
        }
    }
}