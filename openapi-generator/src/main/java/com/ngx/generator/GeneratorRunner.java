package com.ngx.generator;

import org.openapitools.codegen.ClientOptInput;
import org.openapitools.codegen.DefaultGenerator;
import org.openapitools.codegen.config.CodegenConfigurator;

public class GeneratorRunner {
    public static void main(String[] args) {

        CodegenConfigurator configurator = new CodegenConfigurator()
                .setGeneratorName("ts-generator")
                .setInputSpec("micro-frontend-manager.yaml")
                .setOutputDir("generated")
                .addAdditionalProperty("supportsES6", true);

        DefaultGenerator generator = new DefaultGenerator();

        generator.opts(configurator.toClientOptInput());

        generator.generate();
    }
}
