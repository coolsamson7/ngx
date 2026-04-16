package com.ngx.generator;

public class NewRunner {

    public static void main(String[] args) {
        NgxGenerator.runner()
                .input( "micro-frontend-manager.json")
                .outputDir("generated")
                .modelDir("models")
                .serviceDir("services")
                .generateIndex(true)
                .domain("test")
                .filenameStyle(FileNameStyle.KEBAB_CASE)
                .run();
    }
}