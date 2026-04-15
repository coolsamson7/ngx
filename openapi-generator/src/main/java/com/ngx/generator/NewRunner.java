package com.ngx.generator;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.parser.OpenAPIV3Parser;

import java.util.List;

public class NewRunner {

    public static void main(String[] args) {
        String specFile = "micro-frontend-manager.yaml";
        String outputDir = "generated";

        // 1️⃣ Load OpenAPI spec
        OpenAPI openApi = new OpenAPIV3Parser().read(specFile);
        if (openApi == null) {
            System.err.println("Failed to parse OpenAPI spec: " + specFile);
            System.exit(1);
        }

        // 2️⃣ Create Mustache renderer
        MustacheRenderer renderer = new MustacheRenderer();

        // 3️⃣ Create our generator
        NgxGenerator generator = new NgxGenerator(renderer);

        // 4️⃣ Generate models
        generator.generateModels(openApi);

        // 5️⃣ Generate services
        generator.generateServices(openApi);

        System.out.println("Generation complete. Check the 'generated' folder.");
    }
}