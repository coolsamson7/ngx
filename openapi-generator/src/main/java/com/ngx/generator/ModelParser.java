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
    public record EnumType(TypeRef baseType, List<String> values) implements TypeRef {}

    public static class ClassModel {
        public final String name;
        public final List<Property> properties = new ArrayList<>();
        public final Set<String> imports = new LinkedHashSet<>();
        public String parent;
        public ClassModel(String name) { this.name = name; }
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
    // PARSING
    // =========================================================

    public List<ClassModel> generateClasses() {
        List<ClassModel> result = new ArrayList<>();
        if (openAPI.getComponents() == null || openAPI.getComponents().getSchemas() == null) return result;
        for (var e : openAPI.getComponents().getSchemas().entrySet()) {
            result.add(parseClass(e.getKey(), e.getValue()));
        }
        return result;
    }

    private ClassModel parseClass(String name, Schema<?> schema) {
        ClassModel model = new ClassModel(name);
        if (schema.getAllOf() != null && !schema.getAllOf().isEmpty()) {
            for (Schema<?> s : schema.getAllOf()) {
                TypeRef t = resolve(s, model.imports);
                if (t instanceof Ref r) model.parent = r.name();
                else addProperties(model, s);
            }
        } else {
            addProperties(model, schema);
        }
        return model;
    }

    private void addProperties(ClassModel model, Schema<?> schema) {
        if (schema.getProperties() == null) return;
        Set<String> required = schema.getRequired() != null ? new HashSet<>(schema.getRequired()) : Set.of();
        for (var e : schema.getProperties().entrySet()) {
            TypeRef type = resolve(e.getValue(), model.imports);
            Property p = new Property(e.getKey(), type);
            p.required = required.contains(e.getKey());
            p.nullable = isNullable(e.getValue());
            model.properties.add(p);
        }
    }

    private TypeRef resolve(Schema<?> schema, Set<String> imports) {
        if (schema == null) return new Primitive("any");
        if (schema.get$ref() != null) {
            String ref = schema.get$ref().replace("#/components/schemas/", "");
            imports.add(ref);
            return new Ref(ref);
        }
        if (schema.getEnum() != null && !schema.getEnum().isEmpty()) {
            return new EnumType(primitive(schema), schema.getEnum().stream().map(Object::toString).toList());
        }

        List<Schema> options = (schema instanceof ComposedSchema cs) ?
                (cs.getAnyOf() != null ? cs.getAnyOf() : cs.getOneOf()) :
                (schema.getAnyOf() != null ? schema.getAnyOf() : schema.getOneOf());

        if (options != null && !options.isEmpty()) return union(options, imports);

        String typeStr = getEffectiveType(schema);
        if ("array".equals(typeStr) || schema.getItems() != null) {
            return new Array(schema.getItems() != null ? resolve(schema.getItems(), imports) : new Primitive("any"));
        }
        if ("object".equals(typeStr) || schema.getProperties() != null) return new ObjectType("object");
        return primitive(schema);
    }

    private TypeRef union(List<Schema> schemas, Set<String> imports) {
        List<TypeRef> types = schemas.stream()
                .map(s -> resolve(s, imports))
                .filter(t -> !(t instanceof Primitive p && "any".equals(p.name())))
                .distinct()
                .collect(Collectors.toList());

        if (types.isEmpty()) return new Primitive("any");
        if (types.size() == 1) return types.get(0);
        return new Union(types);
    }

    private String getEffectiveType(Schema<?> schema) {
        if (schema.getType() != null) return schema.getType();
        if (schema.getTypes() != null && !schema.getTypes().isEmpty()) {
            return schema.getTypes().stream().filter(t -> !"null".equals(t)).findFirst().orElseGet(() -> schema.getTypes().iterator().next());
        }
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
        if (Boolean.TRUE.equals(schema.getNullable())) return true;
        String t = getEffectiveType(schema);
        if ("null".equals(t)) return true;
        if (schema.getTypes() != null && schema.getTypes().contains("null")) return true;
        List<Schema> options = (schema.getAnyOf() != null) ? schema.getAnyOf() : schema.getOneOf();
        return options != null && options.stream().anyMatch(s -> "null".equals(getEffectiveType(s)));
    }

    // =========================================================
    // GENERATION: TS INTERFACE
    // =========================================================

    public String generateTypeScriptType(TypeRef type, boolean nullable) {
        String tsType = resolveTsType(type);
        // Ensure no "string | null | null"
        if (nullable && !tsType.contains("null")) return tsType + " | null";
        return tsType;
    }

    private String resolveTsType(TypeRef type) {
        if (type instanceof Primitive p) {
            return switch (p.name()) {
                case "integer", "number" -> "number";
                case "string" -> "string";
                case "boolean" -> "boolean";
                case "null" -> "null";
                default -> "any";
            };
        }
        if (type instanceof EnumType e) {
            boolean isStr = e.baseType() instanceof Primitive p && "string".equals(p.name());
            return e.values().stream().map(v -> isStr ? "\"" + v + "\"" : v).collect(Collectors.joining(" | "));
        }
        if (type instanceof Array a) {
            String inner = resolveTsType(a.item());
            return inner.contains("|") ? "(" + inner + ")[]" : inner + "[]";
        }
        if (type instanceof Union u) {
            return u.types().stream().map(this::resolveTsType).distinct().collect(Collectors.joining(" | "));
        }
        if (type instanceof Ref r) return r.name();
        return "any";
    }

    // =========================================================
    // GENERATION: METADATA DESCRIPTOR (DSL)
    // =========================================================

    public String generateMetadataDescriptor(Property prop) {
        String descriptor = resolveDescriptor(prop.type, false);

        if (prop.nullable) {
            descriptor += ".nullable()";
        }

        if (!prop.required) {
            descriptor = "optional(" + descriptor + ")";
        }

        return descriptor;
    }

    private String resolveDescriptor(TypeRef type, boolean inCollection) {
        if (type instanceof Primitive p) {
            return switch (p.name()) {
                case "integer", "number" -> "number()";
                case "string" -> "string()";
                case "boolean" -> "boolean()";
                case "null" -> "nullType()";
                default -> "any()";
            };
        }
        if (type instanceof EnumType e) {
            boolean isStr = e.baseType() instanceof Primitive p && "string".equals(p.name());
            String values = e.values().stream().map(v -> isStr ? "\"" + v + "\"" : v).collect(Collectors.joining(", "));
            return "oneOf(" + values + ")";
        }
        if (type instanceof Array a) {
            return "array(" + resolveDescriptor(a.item(), true) + ")";
        }
        if (type instanceof Union u) {
            // FIX: If we have multiple types in a union, we filter out 'null'
            // from the list because .nullable() will be added by the parent.
            List<TypeRef> filteredTypes = u.types().stream()
                    .filter(t -> !(t instanceof Primitive p && "null".equals(p.name())))
                    .toList();

            if (filteredTypes.size() == 1) {
                return resolveDescriptor(filteredTypes.get(0), inCollection);
            }

            String inners = filteredTypes.stream()
                    .map(t -> resolveDescriptor(t, inCollection))
                    .distinct()
                    .collect(Collectors.joining(", "));
            return "union(" + inners + ")";
        }
        if (type instanceof Ref r) {
            String schemaName = r.name() + "Schema";
            return inCollection ? schemaName : "reference(" + schemaName + ")";
        }
        if (type instanceof ObjectType) return "object()";
        return "any()";
    }
}