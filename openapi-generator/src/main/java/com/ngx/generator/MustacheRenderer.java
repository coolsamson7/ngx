package com.ngx.generator;

import com.github.mustachejava.DefaultMustacheFactory;
import com.github.mustachejava.Mustache;
import com.github.mustachejava.MustacheFactory;
import java.io.StringWriter;
import java.io.IOException;
import java.util.Map;

public class MustacheRenderer {

    private final MustacheFactory mf;

    public MustacheRenderer() {
        // Points the factory to the 'templates' folder in your resources
        // Now it knows where to find both main templates and partials!
        this.mf = new DefaultMustacheFactory("templates");
    }

    /**
     * Renders a template using the provided context.
     *
     * @param templateName The name of the template (e.g., "model.mustache")
     * @param context      The data to fill the template
     * @return The rendered content
     */
    public String render(String templateName, Map<String, Object> context) {
        try (StringWriter writer = new StringWriter()) {
            // compile() now looks relative to the "templates" path defined above
            Mustache mustache = mf.compile(templateName);
            mustache.execute(writer, context).flush();
            return writer.toString();
        } catch (IOException e) {
            throw new RuntimeException("Failed to render template: " + templateName, e);
        }
    }
}