package com.ngx.generator;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.parser.OpenAPIV3Parser;

import java.util.List;

public class NewRunner {

    public static void main(String[] args) {
        NgxGenerator.runner()
                .input( "micro-frontend-manager.json")
                .outputDir("generated")
                .modelDir("models")
                .serviceDir("services")
                .generateIndex(true)
                .filenameStyle(FileNameStyle.KEBAB_CASE)
                .run();
    }
}