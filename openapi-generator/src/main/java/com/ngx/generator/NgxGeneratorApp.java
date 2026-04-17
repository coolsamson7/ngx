package com.ngx.generator;

import picocli.CommandLine;
import picocli.CommandLine.Option;

import java.io.File;

public class NgxGeneratorApp implements Runnable {
    @CommandLine.Parameters(index = "0", description = "Input file")
    File file;

    @Option(names = "--output", description = "Output directory",  defaultValue = "generated")
    String output;

    @Option(names = "--domain", description = "service domain", defaultValue = "")
    String domain;

    @Option(names = "--modelDir", defaultValue = "models", description = "the model directory")
    String modelDir;

    @Option(names = "--serviceDir", defaultValue = "models", description = "the service directory")
    String serviceDir;

    @Option(names = {"-models"}, description = "Generate models", defaultValue = "true")
    boolean models;

    @Option(names = {"-services"}, description = "Generate services", defaultValue = "true")
    boolean services;

    @Option(names = {"-index"}, description = "Generate index.ts", defaultValue = "true")
    boolean index;

    // implement Runnbale

    @Override
    public void run() {
        NgxGenerator.runner()
                .input(file.getName())
                .outputDir(output)
                .modelDir(modelDir)
                .serviceDir(serviceDir)
                .generateIndex(true)
                .domain(domain)
                .filenameStyle(FileNameStyle.KEBAB_CASE)
                .run();
    }

    // main

    public static void main(String[] args) {
        CommandLine.run(new NgxGeneratorApp(), args);
    }
}