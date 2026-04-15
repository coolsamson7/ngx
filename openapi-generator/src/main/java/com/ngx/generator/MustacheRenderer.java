package com.ngx.generator;

import com.github.mustachejava.DefaultMustacheFactory;
import com.github.mustachejava.Mustache;
import com.github.mustachejava.MustacheException;

import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.StringWriter;
import java.io.IOException;
import java.util.Map;

public class MustacheRenderer {

    private final DefaultMustacheFactory mf;

    public MustacheRenderer() {
        this.mf = new DefaultMustacheFactory();
    }

    /**
     * Renders a template from resources/templates/{templateName} using the provided context.
     *
     * @param templateName The file name of the template (e.g., "model.mustache")
     * @param context      A map containing the template variables
     * @return The rendered template as a String
     */
    public String render(String templateName, Map<String, Object> context) {
        try (StringWriter writer = new StringWriter()) {

            InputStream is = getClass().getClassLoader().getResourceAsStream("templates/" + templateName);
            if (is == null) {
                throw new MustacheException("Template not found in classpath: templates/" + templateName);
            }

            Mustache mustache = mf.compile(new InputStreamReader(is), templateName);
            mustache.execute(writer, context).flush();
            return writer.toString();

        } catch (IOException e) {
            throw new RuntimeException("Failed to render template: " + templateName, e);
        }
    }
}