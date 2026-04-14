package com.assaia.generator;

import org.openapitools.codegen.ClientOptInput;
import org.openapitools.codegen.DefaultGenerator;
import org.openapitools.codegen.config.CodegenConfigurator;


import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

import java.io.File;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class TestGenerator {

    private static final String OUTPUT_DIR = "generated";

    @AfterEach
    public void cleanUp() {
        // Löschen Sie den "generated"-Ordner nach jedem Test, wenn nötig
        // Commented out to keep generated files for inspection
        // File outputDir = new File(OUTPUT_DIR);
        // if (outputDir.exists()) {
        //     deleteDirectory(outputDir);
        // }
    }

    @Test
    public void testGeneratorExecution() {
        // Führen Sie die main-Methode des GeneratorRunner aus

        CodegenConfigurator configurator = new CodegenConfigurator()
                .setGeneratorName("ts-generator")
                .setInputSpec("micro-frontend-manager.yaml")
                .setOutputDir("generated")
                .addAdditionalProperty("supportsES6", true);

        DefaultGenerator generator = new DefaultGenerator();

        generator.opts(configurator.toClientOptInput());

        generator.generate();

        // Überprüfen Sie, ob das generierte Verzeichnis existiert
        File outputDir = new File(OUTPUT_DIR);
        assertTrue(outputDir.exists() && outputDir.isDirectory(),
                "Output directory was not created");
    }

    // Hilfsmethode, um das Verzeichnis beim Cleanup rekursiv zu löschen
    private void deleteDirectory(File dir) {
        File[] files = dir.listFiles();
        if (files != null) {
            for (File file : files) {
                if (file.isDirectory()) {
                    deleteDirectory(file);
                } else {
                    file.delete();
                }
            }
        }
        dir.delete();
    }
}
