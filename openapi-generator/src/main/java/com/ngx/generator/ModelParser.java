package com.ngx.generator;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.media.Schema;
import io.swagger.v3.oas.models.media.ComposedSchema;

import java.util.*;
import java.util.stream.Collectors;

public class ModelParser {

    private final OpenAPI openAPI;

    public ModelParser(OpenAPI openAPI) {
        this.openAPI = openAPI;
    }

    // =========================================================
    // TYPES
    // =========================================================

    public sealed interface TypeRef permits Primitive, Array, Union, Ref, ObjectType, EnumType {}

    public record Primitive(String name) implements TypeRef {}

    public record Array(TypeRef item) implements TypeRef {}

    public record Union(List<TypeRef> types) implements TypeRef {}

    public record Ref(String name) implements TypeRef {}

    public record ObjectType(String name) implements TypeRef {}

    /**
     * EnumType captures the underlying primitive type and the allowed values.
     * baseType: Usually Primitive("string") or Primitive("number")
     * values: The raw enum strings/numbers from the schema
     */
    public record EnumType(TypeRef baseType, List<String> values) implements TypeRef {}

    // =========================================================
    // CLASS MODEL
    // =========================================================

    public static class ClassModel {
        public final String name;
        public final List<Property> properties = new ArrayList<>();
        public final Set<String> imports = new LinkedHashSet<>();
        public String parent;

        public ClassModel(String name) {
            this.name = name;
        }
    }

    public static class Property {
        public final String name;
        public final TypeRef type;
        public boolean required;
        public boolean nullable;

        public Property(String name, TypeRef type) {
            this.name = name;
            this.type = type;
        }
    }

    // =========================================================
    // ENTRY POINT
    // =========================================================

    public List<ClassModel> generateClasses() {
        List<ClassModel> result = new ArrayList<>();

        if (openAPI.getComponents() == null || openAPI.getComponents().getSchemas() == null) {
            return result;
        }

        for (var e : openAPI.getComponents().getSchemas().entrySet()) {
            result.add(parseClass(e.getKey(), e.getValue()));
        }

        return result;
    }

    // =========================================================
    // CLASS PARSING
    // =========================================================

    private ClassModel parseClass(String name, Schema<?> schema) {
        ClassModel model = new ClassModel(name);

        if (schema.getAllOf() != null && !schema.getAllOf().isEmpty()) {
            for (Schema<?> s : schema.getAllOf()) {
                TypeRef t = resolve(s, model.imports);
                if (t instanceof Ref r) {
                    model.parent = r.name();
                } else {
                    addProperties(model, s);
                }
            }
        } else {
            addProperties(model, schema);
        }

        return model;
    }

    private void addProperties(ClassModel model, Schema<?> schema) {
        if (schema.getProperties() == null) return;

        Set<String> required = schema.getRequired() != null
                ? new HashSet<>(schema.getRequired())
                : Set.of();

        for (var e : schema.getProperties().entrySet()) {
            String name = e.getKey();
            Schema<?> propSchema = e.getValue();

            TypeRef type = resolve(propSchema, model.imports);

            Property p = new Property(name, type);
            p.required = required.contains(name);
            p.nullable = isNullable(propSchema);

            model.properties.add(p);
        }
    }

    // =========================================================
    // TYPE RESOLUTION
    // =========================================================

    private TypeRef resolve(Schema<?> schema, Set<String> imports) {
        if (schema == null) return new Primitive("any");

        // 1. Reference Check
        if (schema.get$ref() != null) {
            String ref = schema.get$ref().replace("#/components/schemas/", "");
            imports.add(ref);
            return new Ref(ref);
        }

        // 2. Enum Detection (Priority)
        if (schema.getEnum() != null && !schema.getEnum().isEmpty()) {
            List<String> values = schema.getEnum().stream()
                    .map(Object::toString)
                    .collect(Collectors.toList());

            // Link back to the primitive base (string, number, etc.)
            TypeRef base = primitive(schema);
            return new EnumType(base, values);
        }

        // 3. Union Detection (anyOf/oneOf)
        List<Schema> options = null;
        if (schema instanceof ComposedSchema cs) {
            options = cs.getAnyOf() != null ? cs.getAnyOf() : cs.getOneOf();
        } else if (schema.getAnyOf() != null) {
            options = schema.getAnyOf();
        } else if (schema.getOneOf() != null) {
            options = schema.getOneOf();
        }

        if (options != null && !options.isEmpty()) {
            return union(options, imports);
        }

        // 4. Effective Type Checks
        String typeStr = getEffectiveType(schema);

        // Array
        if ("array".equals(typeStr) || schema.getItems() != null) {
            Schema<?> items = schema.getItems();
            return new Array(items != null ? resolve(items, imports) : new Primitive("any"));
        }

        // Object
        if ("object".equals(typeStr) || schema.getProperties() != null) {
            return new ObjectType("object");
        }

        return primitive(schema);
    }

    private TypeRef union(List<Schema> schemas, Set<String> imports) {
        List<TypeRef> types = schemas.stream()
                .map(s -> resolve(s, imports))
                .distinct()
                .collect(Collectors.toList());

        if (types.isEmpty()) return new Primitive("any");
        if (types.size() == 1) return types.get(0);
        return new Union(types);
    }

    // =========================================================
    // CORE HELPERS
    // =========================================================

    private String getEffectiveType(Schema<?> schema) {
        // Standard single type
        if (schema.getType() != null) return schema.getType();

        // OpenAPI 3.1 type list (e.g., ["string", "null"])
        if (schema.getTypes() != null && !schema.getTypes().isEmpty()) {
            return schema.getTypes().stream()
                    .filter(t -> !"null".equals(t))
                    .findFirst()
                    .orElseGet(() -> schema.getTypes().iterator().next());
        }

        // Semantic fallback if enum is present but type is missing
        if (schema.getEnum() != null && !schema.getEnum().isEmpty()) return "string";

        return null;
    }

    private TypeRef primitive(Schema<?> schema) {
        String t = getEffectiveType(schema);
        if (t == null) return new Primitive("any");

        return switch (t) {
            case "string" -> new Primitive("string");
            case "integer", "number" -> new Primitive("number");
            case "boolean" -> new Primitive("boolean");
            case "null" -> new Primitive("null");
            default -> new Primitive("any");
        };
    }

    private boolean isNullable(Schema<?> schema) {
        if (schema == null) return false;

        // Check standard nullable field
        if (Boolean.TRUE.equals(schema.getNullable())) return true;

        // Check 3.1 type list for 'null'
        if (schema.getTypes() != null && schema.getTypes().contains("null")) return true;

        // Check for 'null' type string
        String t = getEffectiveType(schema);
        if ("null".equals(t)) return true;

        // Check for null branch in a union
        List<Schema> options = schema.getAnyOf() != null ? schema.getAnyOf() : schema.getOneOf();
        if (options != null) {
            return options.stream().anyMatch(s -> "null".equals(getEffectiveType(s)));
        }

        return false;
    }
}