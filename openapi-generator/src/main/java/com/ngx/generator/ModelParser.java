package com.ngx.generator;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.media.ComposedSchema;
import io.swagger.v3.oas.models.media.Schema;

import java.util.*;

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
    public record EnumType(TypeRef baseType, List<String> values) implements TypeRef {}

    // =========================================================
    // MODEL
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
    // ENTRY
    // =========================================================

    public List<ClassModel> generateClasses() {
        List<ClassModel> result = new ArrayList<>();

        if (openAPI.getComponents() == null || openAPI.getComponents().getSchemas() == null)
            return result;

        for (var e : openAPI.getComponents().getSchemas().entrySet()) {
            result.add(parseClass(e.getKey(), e.getValue()));
        }

        return result;
    }

    private ClassModel parseClass(String name, Schema<?> schema) {
        ClassModel model = new ClassModel(name);

        if (schema.getAllOf() != null && !schema.getAllOf().isEmpty()) {
            for (Schema<?> s : schema.getAllOf()) {
                if (s.get$ref() != null) {
                    model.parent = refName(s.get$ref());
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
            Schema<?> propSchema = (Schema<?>) e.getValue();

            TypeRef type = resolve(propSchema, model.imports);

            Property p = new Property(e.getKey(), type);
            p.required = required.contains(e.getKey());
            p.nullable = isNullable(propSchema);

            model.properties.add(p);
        }
    }

    // =========================================================
    // TYPE RESOLUTION (FIXED CORE)
    // =========================================================

    TypeRef resolve(Schema<?> schema, Set<String> imports) {
        if (schema == null) return new Primitive("any");

        // REF
        if (schema.get$ref() != null) {
            String ref = refName(schema.get$ref());
            imports.add(ref);
            return new Ref(ref);
        }

        // ENUM
        if (schema.getEnum() != null && !schema.getEnum().isEmpty()) {
            return new EnumType(
                    new Primitive("string"),
                    schema.getEnum().stream().map(Object::toString).toList()
            );
        }

        // ANYOF / ONEOF
        List<Schema> composed = getComposed(schema);
        if (composed != null && !composed.isEmpty()) {
            List<TypeRef> types = new ArrayList<>();

            for (Schema s : composed) {
                if (isNullSchema(s)) continue;
                types.add(resolve(s, imports));
            }

            if (types.isEmpty()) return new Primitive("any");
            if (types.size() == 1) return types.get(0);

            return new Union(types);
        }

        String type = schema.getType();

        // ARRAY
        if ("array".equals(type) || schema.getItems() != null) {
            Schema<?> items = schema.getItems() != null ? schema.getItems() : new Schema<>();
            return new Array(resolve(items, imports));
        }

        // OBJECT
        if ("object".equals(type) || schema.getProperties() != null) {
            return new ObjectType("object");
        }

        return mapPrimitive(type);
    }

    private Primitive mapPrimitive(String type) {
        if (type == null) return new Primitive("any");

        return switch (type) {
            case "string" -> new Primitive("string");
            case "integer", "number" -> new Primitive("number");
            case "boolean" -> new Primitive("boolean");
            case "null" -> new Primitive("null");
            default -> new Primitive("any");
        };
    }

    // =========================================================
    // NULL + COMPOSED HELPERS
    // =========================================================

    private List<Schema> getComposed(Schema<?> schema) {
        if (schema instanceof ComposedSchema cs) {
            return firstNonNull(cs.getAnyOf(), cs.getOneOf());
        }
        return firstNonNull(schema.getAnyOf(), schema.getOneOf());
    }

    private List<Schema> firstNonNull(List<Schema> a, List<Schema> b) {
        return a != null ? a : b;
    }

    private boolean isNullSchema(Schema<?> s) {
        if (s == null) return true;
        if ("null".equals(s.getType())) return true;
        if (s.getTypes() != null && s.getTypes().contains("null")) return true;
        return false;
    }

    private boolean isNullable(Schema<?> schema) {
        if (schema == null) return false;
        if (Boolean.TRUE.equals(schema.getNullable())) return true;

        List<Schema> composed = getComposed(schema);
        if (composed != null) {
            for (Schema s : composed) {
                if (isNullSchema(s)) return true;
            }
        }
        return false;
    }

    private String refName(String ref) {
        return ref.replace("#/components/schemas/", "");
    }

    // =========================================================
    // TYPESCRIPT GENERATION
    // =========================================================

    public String generateTypeScriptType(TypeRef type, boolean nullable) {
        String ts = ts(type);
        return nullable ? ts + " | null" : ts;
    }

    private String ts(TypeRef type) {
        if (type instanceof Primitive p) {
            return switch (p.name()) {
                case "string" -> "string";
                case "number" -> "number";
                case "boolean" -> "boolean";
                case "null" -> "null";
                default -> "any";
            };
        }

        if (type instanceof Array a) {
            String inner = ts(a.item());
            return inner.contains("|") ? "(" + inner + ")[]" : inner + "[]";
        }

        if (type instanceof Union u) {
            return u.types().stream()
                    .map(this::ts)
                    .distinct()
                    .reduce((a, b) -> a + " | " + b)
                    .orElse("any");
        }

        if (type instanceof Ref r) return r.name();

        return "any";
    }

    // =========================================================
    // METADATA DSL GENERATION (UNCHANGED API)
    // =========================================================

    public String generateMetadataDescriptor(Property prop) {
        String d = descriptor(prop.type, false);

        if (prop.nullable) d += ".nullable()";
        if (!prop.required) d = "optional(" + d + ")";

        return d;
    }

    private String descriptor(TypeRef type, boolean inArray) {

        if (type instanceof Primitive p) {
            return switch (p.name()) {
                case "string" -> "string()";
                case "number" -> "number()";
                case "boolean" -> "boolean()";
                default -> "any()";
            };
        }

        if (type instanceof Array a) {
            return "array(" + descriptor(a.item(), true) + ")";
        }

        if (type instanceof Union u) {
            List<TypeRef> cleaned = u.types().stream()
                    .filter(t -> !(t instanceof Primitive p && "null".equals(p.name())))
                    .toList();

            if (cleaned.size() == 1) return descriptor(cleaned.get(0), inArray);

            return "union(" +
                    cleaned.stream()
                            .map(t -> descriptor(t, inArray))
                            .reduce((a, b) -> a + ", " + b)
                            .orElse("any()")
                    + ")";
        }

        if (type instanceof Ref r) {
            return inArray ? r.name() + "Schema" : "reference(" + r.name() + "Schema)";
        }

        if (type instanceof ObjectType) return "object()";

        return "any()";
    }
}