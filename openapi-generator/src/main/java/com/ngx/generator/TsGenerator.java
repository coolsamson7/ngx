/* This code is based on TypescriptClientCodegen.java from the OpenAPI-Generator project.
 * Original copyright below.
 *
 * ============================================================================
 * Copyright 2020 OpenAPI-Generator Contributors (https://openapi-generator.tech)
 * Copyright 2018 SmartBear Software
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

package com.ngx.generator;

import com.github.curiousoddman.rgxgen.RgxGen;
import com.google.common.collect.Sets;
import io.swagger.v3.core.util.Json;
import io.swagger.v3.oas.models.media.*;
import io.swagger.v3.oas.models.parameters.Parameter;
import io.swagger.v3.oas.models.parameters.RequestBody;
import org.apache.commons.lang3.StringUtils;
import org.openapitools.codegen.*;
import org.openapitools.codegen.meta.GeneratorMetadata;
import org.openapitools.codegen.meta.Stability;
import org.openapitools.codegen.model.*;
import org.openapitools.codegen.utils.ModelUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.io.File;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import static org.openapitools.codegen.utils.CamelizeOption.LOWERCASE_FIRST_LETTER;
import static org.openapitools.codegen.utils.OnceLogger.once;
import static org.openapitools.codegen.utils.StringUtils.camelize;
import static org.openapitools.codegen.utils.StringUtils.underscore;

public class TsGenerator extends DefaultCodegen implements CodegenConfig {
    private final Logger LOGGER = LoggerFactory.getLogger(TsGenerator.class);

    private static final String X_DISCRIMINATOR_TYPE = "x-discriminator-value";
    private static final String UNDEFINED_VALUE = "undefined";
    private static final String FILE_CONTENT_DATA_TYPE = "fileContentDataType";
    private static final String FILE_CONTENT_DATA_TYPE_DESC = "Specifies the type to use for the content of a file - i.e. Blob (Browser, Deno) / Buffer (node)";
    private static final String DOMAIN_PROPERTY = "domain";

    protected String modelPropertyNaming = "camelCase";
    protected HashSet<String> languageGenericTypes;

    private final DateTimeFormatter iso8601Date = DateTimeFormatter.ISO_DATE;
    private final DateTimeFormatter iso8601DateTime = DateTimeFormatter.ISO_DATE_TIME;

    public TsGenerator() {
        super();

        this.generatorMetadata = GeneratorMetadata.newBuilder(generatorMetadata)
                .stability(Stability.EXPERIMENTAL).build();

        outputFolder = "generated-code" + File.separator + "typescript";
        templateDir = "ts-generator";
        supportsInheritance = true;

        reservedWords.addAll(Arrays.asList(
                "varLocalPath", "queryParameters", "headerParams", "formParams", "useFormData",
                "varLocalDeferred", "requestOptions", "from",
                "abstract", "await", "boolean", "break", "byte", "case", "catch", "char", "class",
                "const", "constructor", "continue", "debugger", "default", "delete", "do", "double",
                "else", "enum", "export", "extends", "false", "final", "finally", "float", "for",
                "function", "goto", "if", "implements", "import", "in", "instanceof", "int",
                "interface", "let", "long", "native", "new", "null", "package", "private",
                "protected", "public", "return", "short", "static", "super", "switch",
                "synchronized", "this", "throw", "transient", "true", "try", "typeof", "var",
                "void", "volatile", "while", "with", "yield"));

        languageSpecificPrimitives = new HashSet<>(Arrays.asList(
                "string", "String", "boolean", "Boolean", "Double", "Integer", "Long", "Float",
                "Object", "Array", "Date", "number", "any", "File", "Error", "Map", "Set"));

        languageGenericTypes = new HashSet<>(Arrays.asList("Array"));

        instantiationTypes.put("array", "Array");

        typeMapping = new HashMap<>();
        typeMapping.put("Array", "Array");
        typeMapping.put("array", "Array");
        typeMapping.put("List", "Array");
        typeMapping.put("boolean", "boolean");
        typeMapping.put("string", "string");
        typeMapping.put("int", "number");
        typeMapping.put("float", "number");
        typeMapping.put("number", "number");
        typeMapping.put("long", "number");
        typeMapping.put("short", "number");
        typeMapping.put("char", "string");
        typeMapping.put("double", "number");
        typeMapping.put("object", "any");
        typeMapping.put("integer", "number");
        typeMapping.put("Map", "any");
        typeMapping.put("map", "any");
        typeMapping.put("Set", "Set");
        typeMapping.put("set", "Set");
        typeMapping.put("date", "string");
        typeMapping.put("DateTime", "Date");
        typeMapping.put("binary", "any");
        typeMapping.put("File", "any");
        typeMapping.put("file", "any");
        typeMapping.put("ByteArray", "string");
        typeMapping.put("UUID", "string");
        typeMapping.put("Error", "Error");
        typeMapping.put("AnyType", "any");
        typeMapping.put("URI", "string");

        cliOptions.add(new CliOption(CodegenConstants.MODEL_PROPERTY_NAMING,
                CodegenConstants.MODEL_PROPERTY_NAMING_DESC).defaultValue("camelCase"));
        cliOptions.add(new CliOption(CodegenConstants.SUPPORTS_ES6,
                CodegenConstants.SUPPORTS_ES6_DESC).defaultValue("false"));
        cliOptions.add(new CliOption(FILE_CONTENT_DATA_TYPE,
                FILE_CONTENT_DATA_TYPE_DESC).defaultValue("Buffer"));
        cliOptions.add(new CliOption(DOMAIN_PROPERTY,
                "domain of generated apis (for @RegisterService)").defaultValue(""));

        setModelPackage("model");
        modelTemplateFiles.put("model" + File.separator + "model.mustache", ".ts");

        setApiPackage("api");
        apiTemplateFiles.put("api" + File.separator + "api.mustache", ".ts");
    }

    // -------------------------------------------------------------------------
    // Generator identity
    // -------------------------------------------------------------------------

    @Override public String getName()   { return "ts-generator"; }
    @Override public String getHelp()   { return "Custom generator plugin for OpenAPI Generator to fit our code style"; }
    @Override public CodegenType getTag() { return CodegenType.CLIENT; }
    @Override public GeneratorLanguage generatorLanguage() { return GeneratorLanguage.TYPESCRIPT; }

    // -------------------------------------------------------------------------
    // Names
    // -------------------------------------------------------------------------

    @Override
    public String toApiName(String name) {
        if (name.length() == 0) return "DefaultApi";
        if (name.endsWith("Controller")) name = name.replace("Controller", "Service");
        if (!name.endsWith("Service"))   name += "Service";
        return camelize(name);
    }

    @Override
    public String escapeReservedWord(String name) {
        return reservedWordsMappings().containsKey(name)
                ? reservedWordsMappings().get(name)
                : "_" + name;
    }

    @Override
    public String toParamName(String name) { return toVarName(name); }

    @Override
    public String toVarName(String name) {
        name = sanitizeName(name);
        if ("_".equals(name)) return "_u";
        if (name.matches("^[A-Z_]*$")) return name;
        name = getNameUsingModelPropertyNaming(name);
        if (isReservedWord(name) || name.matches("^\\d.*")) name = escapeReservedWord(name);
        return name;
    }

    @Override
    public String toModelName(final String name) {
        return toTypescriptTypeName(
                addSuffix(addPrefix(name, modelNamePrefix), modelNameSuffix), "Model");
    }

    @Override
    public String toModelImport(String name) {
        return "../model/" + toModelName(name);
    }

    @Override
    public String toModelFilename(String name) { return toModelName(name); }

    @Override
    public String toOperationId(String operationId) {
        if (StringUtils.isEmpty(operationId))
            throw new RuntimeException("Empty method name (operationId) not allowed");
        if (isReservedWord(operationId))
            return escapeReservedWord(camelize(sanitizeName(operationId), LOWERCASE_FIRST_LETTER));
        return camelize(sanitizeName(operationId), LOWERCASE_FIRST_LETTER);
    }

    @Override
    public String toEnumValue(String value, String datatype) {
        return "number".equals(datatype) ? value : "'" + escapeText(value) + "'";
    }

    @Override
    public String toEnumDefaultValue(String value, String datatype) {
        return datatype + "_" + value;
    }

    @Override
    public String toEnumVarName(String name, String datatype) {
        if (name.isEmpty()) return "Empty";
        if (getSymbolName(name) != null) return camelize(getSymbolName(name));

        if ("number".equals(datatype)) {
            return ("NUMBER_" + name)
                    .replaceAll("-", "MINUS_")
                    .replaceAll("\\+", "PLUS_")
                    .replaceAll("\\.", "_DOT_");
        }

        // Convert to SCREAMING_SNAKE_CASE
        String enumName = sanitizeName(name).replaceFirst("^_", "").replaceFirst("_$", "");
        StringBuilder sb = new StringBuilder();
        boolean wasUpper = true;
        for (int i = 0; i < enumName.length(); i++) {
            char ch = enumName.charAt(i);
            if (Character.isUpperCase(ch) && !wasUpper && i > 0 && enumName.charAt(i - 1) != '_')
                sb.append('_');
            sb.append(Character.toUpperCase(ch));
            wasUpper = Character.isUpperCase(ch);
        }
        enumName = sb.toString();
        return enumName.matches("\\d.*") ? "_" + enumName : enumName;
    }

    @Override
    public String toEnumName(CodegenProperty property) {
        String enumName = toModelName(property.name) + "Enum";
        return enumName.matches("\\d.*") ? "_" + enumName : enumName;
    }

    @Override
    public String toAnyOfName(List<String> names, ComposedSchema cs) {
        return String.join(" | ", getTypesFromSchemas(cs.getAnyOf()));
    }

    @Override
    public String toOneOfName(List<String> names, ComposedSchema cs) {
        return String.join(" | ", getTypesFromSchemas(cs.getOneOf()));
    }

    @Override
    public String toAllOfName(List<String> names, ComposedSchema cs) {
        return String.join(" & ", getTypesFromSchemas(cs.getAllOf()));
    }

    // -------------------------------------------------------------------------
    // Type resolution (TypeScript interface types)
    // -------------------------------------------------------------------------

    @Override
    protected boolean isReservedWord(String word) {
        // TypeScript is case-sensitive — do not use case-insensitive matching
        return reservedWords.contains(word);
    }

    /**
     * Resolves an OpenAPI schema to a TypeScript interface type (e.g. "string | number | null").
     * Does NOT produce schema-builder expressions — see {@link #toSchemaBuilderExpression}.
     */
    @Override
    public String getSchemaType(Schema p) {
        // anyOf / oneOf / allOf — check both OpenAPI 3.0 (ComposedSchema) and 3.1 (plain Schema)
        List<Schema> anyOf = coalesce(p.getAnyOf(), p instanceof ComposedSchema ? ((ComposedSchema) p).getAnyOf() : null);
        List<Schema> oneOf = coalesce(p.getOneOf(), p instanceof ComposedSchema ? ((ComposedSchema) p).getOneOf() : null);
        List<Schema> allOf = coalesce(p.getAllOf(), p instanceof ComposedSchema ? ((ComposedSchema) p).getAllOf() : null);

        if (anyOf != null && !anyOf.isEmpty()) return String.join(" | ", getTypesFromSchemas(anyOf));
        if (oneOf != null && !oneOf.isEmpty()) return String.join(" | ", getTypesFromSchemas(oneOf));
        if (allOf != null && !allOf.isEmpty()) return String.join(" & ", getTypesFromSchemas(allOf));

        String openAPIType = super.getSchemaType(p);

        // Object schema resolved to "any" but has explicit properties → model
        if ("any".equals(openAPIType) && p.getProperties() != null && !p.getProperties().isEmpty()) {
            if (p.getTitle() != null && !p.getTitle().isEmpty())
                return toModelName(p.getTitle());
        }

        // OpenAPI 3.1 `types` array
        String fromTypes = schemaTypeFromTypesArray(p);
        if (fromTypes != null) return fromTypes;

        // Primitives
        if (ModelUtils.isStringSchema(p))  return "string";
        if (ModelUtils.isIntegerSchema(p)) return "number";
        if (ModelUtils.isNumberSchema(p))  return "number";
        if (ModelUtils.isBooleanSchema(p)) return "boolean";

        if (typeMapping.containsKey(openAPIType)) {
            String mapped = typeMapping.get(openAPIType);
            if (languageSpecificPrimitives.contains(mapped)) return mapped;
        } else {
            return toModelName(openAPIType);
        }

        return typeMapping.getOrDefault(openAPIType, toModelName(openAPIType));
    }

    @Override
    public String getTypeDeclaration(Schema p) {
        if (p.get$ref() != null) return super.getTypeDeclaration(p);

        if (ModelUtils.isArraySchema(p)) {
            Schema inner = ((ArraySchema) p).getItems();
            return getSchemaType(p) + "<" + getTypeDeclaration(unaliasSchema(inner)) + ">";
        }
        if (ModelUtils.isMapSchema(p)) {
            // Object models that also happen to have additionalProperties are not pure maps
            if (p.getProperties() != null && !p.getProperties().isEmpty())
                return super.getTypeDeclaration(p);
            Schema inner = getSchemaAdditionalProperties(p);
            String nullable = Boolean.TRUE.equals(inner.getNullable()) ? " | null" : "";
            return "{ [key: string]: " + getTypeDeclaration(unaliasSchema(inner)) + nullable + "; }";
        }
        if (ModelUtils.isFileSchema(p))   return "HttpFile";
        if (ModelUtils.isBinarySchema(p)) return "any";

        return super.getTypeDeclaration(p);
    }

    @Override
    protected String getParameterDataType(Parameter parameter, Schema p) {
        if (ModelUtils.isComposedSchema(p)) return getSchemaType(p);

        if (ModelUtils.isArraySchema(p)) {
            Schema inner = ((ArraySchema) p).getItems();
            return getSchemaType(p) + "<" + getParameterDataType(parameter, inner) + ">";
        }
        if (ModelUtils.isMapSchema(p)) {
            Schema inner = (Schema) p.getAdditionalProperties();
            return "{ [key: string]: " + getParameterDataType(parameter, inner) + "; }";
        }
        if (ModelUtils.isStringSchema(p) && p.getEnum() != null)
            return enumValuesToEnumTypeUnion(p.getEnum(), "string");
        if ((ModelUtils.isIntegerSchema(p) || ModelUtils.isNumberSchema(p)) && p.getEnum() != null)
            return numericEnumValuesToEnumTypeUnion(new ArrayList<Number>(p.getEnum()));

        return getTypeDeclaration(p);
    }

    @Override
    public String toDefaultValue(Schema p) {
        if (ModelUtils.isNumberSchema(p) || ModelUtils.isIntegerSchema(p)) {
            return p.getDefault() != null ? p.getDefault().toString() : UNDEFINED_VALUE;
        }
        if (ModelUtils.isStringSchema(p)) {
            return p.getDefault() != null ? "'" + p.getDefault() + "'" : UNDEFINED_VALUE;
        }
        return UNDEFINED_VALUE;
    }

    // -------------------------------------------------------------------------
    // Schema-builder expression generation (for `schema-type` vendor extension)
    // -------------------------------------------------------------------------

    /**
     * Converts an OpenAPI Schema into a schema-builder call expression, e.g.:
     * <ul>
     *   <li>{@code string()}</li>
     *   <li>{@code number()}</li>
     *   <li>{@code reference(MyModelSchema)}</li>
     *   <li>{@code array(reference(MyModelSchema))}</li>
     *   <li>{@code anyOf([string(), number()])}</li>
     *   <li>{@code anyOf([string(), number()]).nullable()}</li>
     * </ul>
     */
    private String toSchemaBuilderExpression(Schema schema) {
        if (schema == null) return "any()";

        // $ref → reference(XxxSchema)
        if (schema.get$ref() != null) {
            return "reference(" + toModelName(ModelUtils.getSimpleRef(schema.get$ref())) + "Schema)";
        }

        // anyOf / oneOf / allOf composition
        List<Schema> anyOf = getNonNull(coalesce(schema.getAnyOf(),
                schema instanceof ComposedSchema ? ((ComposedSchema) schema).getAnyOf() : null));
        List<Schema> oneOf = getNonNull(coalesce(schema.getOneOf(),
                schema instanceof ComposedSchema ? ((ComposedSchema) schema).getOneOf() : null));
        List<Schema> allOf = getNonNull(coalesce(schema.getAllOf(),
                schema instanceof ComposedSchema ? ((ComposedSchema) schema).getAllOf() : null));

        if (!anyOf.isEmpty()) return buildCompositionExpression(anyOf, "anyOf");
        if (!oneOf.isEmpty()) return buildCompositionExpression(oneOf, "anyOf"); // oneOf maps to anyOf in runtime schema
        if (!allOf.isEmpty()) return buildAllOfExpression(allOf);

        // Inline enum → oneOf('val1', 'val2')
        if (schema.getEnum() != null && !schema.getEnum().isEmpty()) {
            String values = (String) schema.getEnum().stream()
                    .map(v -> "'" + v.toString() + "'")
                    .collect(Collectors.joining(", "));
            return "oneOf(" + values + ")";
        }

        // Array
        if (ModelUtils.isArraySchema(schema) || hasType(schema, "array")) {
            Schema items = getArrayItems(schema);
            return "array(" + toSchemaBuilderExpression(items) + ")";
        }

        // Map / record
        if (ModelUtils.isMapSchema(schema)) {
            Object addProps = schema.getAdditionalProperties();
            if (addProps instanceof Schema) {
                return "record(" + toSchemaBuilderExpression((Schema) addProps) + ")";
            }
            return "record(string())";
        }

        // Primitives (check these before the generic model-name path)
        if (ModelUtils.isStringSchema(schema))   return "string()";
        if (ModelUtils.isIntegerSchema(schema))  return "number()";
        if (ModelUtils.isNumberSchema(schema))   return "number()";
        if (ModelUtils.isBooleanSchema(schema))  return "boolean()";
        if (ModelUtils.isDateSchema(schema) || ModelUtils.isDateTimeSchema(schema)) return "date()";

        // OpenAPI 3.1 `types` array — fall back for schemas not caught above
        String fromTypes = schemaTypeFromTypesArray(schema);
        if (fromTypes != null) {
            switch (fromTypes) {
                case "string":  return "string()";
                case "number":  return "number()";
                case "boolean": return "boolean()";
            }
        }

        // Named model type
        String type = getSchemaType(schema);
        if ("any".equals(type) || "void".equals(type)) return "any()";
        if ("Date".equals(type)) return "date()";

        // If it's a primitive TS type mapped from OpenAPI, call it as a builder
        if (languageSpecificPrimitives.contains(type)) {
            switch (type) {
                case "string":  return "string()";
                case "number":  return "number()";
                case "boolean": return "boolean()";
                default:        return "any()";
            }
        }

        // Must be a named model → reference
        return "reference(" + toModelName(type) + "Schema)";
    }

    /**
     * Builds {@code anyOf([expr1, expr2])} or, when only one non-null type is present, just that
     * expression. Appends {@code .nullable()} if a null type was present.
     */
    private String buildCompositionExpression(List<Schema> schemas, String combinator) {
        List<String> parts = new ArrayList<>();
        boolean hasNull = false;

        for (Schema s : schemas) {
            if (isNullSchema(s)) {
                hasNull = true;
            } else {
                parts.add(toSchemaBuilderExpression(s));
            }
        }

        if (parts.isEmpty()) return "any()" + (hasNull ? ".nullable()" : "");

        String expr = parts.size() == 1
                ? parts.get(0)
                : combinator + "([" + String.join(", ", parts) + "])";

        return hasNull ? expr + ".nullable()" : expr;
    }

    private String buildAllOfExpression(List<Schema> schemas) {
        List<String> parts = schemas.stream()
                .map(this::toSchemaBuilderExpression)
                .collect(Collectors.toList());
        return parts.size() == 1 ? parts.get(0) : "allOf([" + String.join(", ", parts) + "])";
    }

    // -------------------------------------------------------------------------
    // Property processing
    // -------------------------------------------------------------------------

    @Override
    public CodegenProperty fromProperty(String name, Schema p, boolean required,
                                        boolean schemaIsFromAdditionalProperties) {
        CodegenProperty property = super.fromProperty(name, p, required, schemaIsFromAdditionalProperties);

        // --- 1. Fix dataType for composed / anyOf / oneOf schemas ---
        boolean hasComposition = hasComposition(p);
        if (hasComposition || ModelUtils.isComposedSchema(p) || "any".equals(property.dataType)) {
            String resolved = getSchemaType(p);
            if (resolved != null && !resolved.isEmpty()) {
                property.dataType = resolved;
                property.datatypeWithEnum = resolved;
            }
        }

        // --- 2. Fix nullable: only true if null actually appears in the composition ---
        property.isNullable = containsNullSchema(p);

        // --- 3. Inline enums → union literal type ---
        if (property.isEnum && property._enum != null && !property._enum.isEmpty()) {
            String union = property._enum.stream()
                    .map(v -> "'" + v.toString() + "'")
                    .collect(Collectors.joining(" | "));
            property.datatypeWithEnum = union;
            property.dataType = union;
        }

        // --- 4. schema-type vendor extension (schema-builder expression) ---
        property.vendorExtensions.put("schema-type", toSchemaBuilderExpression(p));

        // --- 5. base-type vendor extension ---
        String baseType = "Date".equals(property.baseType) ? "date" : property.baseType;
        property.vendorExtensions.put("base-type",
                property.dataType.equals(baseType) ? "" : baseType + "()");

        return property;
    }

    @Override
    protected void addAdditionPropertiesToCodeGenModel(CodegenModel codegenModel, Schema schema) {
        codegenModel.additionalPropertiesType = getTypeDeclaration((Schema) schema.getAdditionalProperties());
        addImport(codegenModel, codegenModel.additionalPropertiesType);
    }

    // -------------------------------------------------------------------------
    // Model post-processing
    // -------------------------------------------------------------------------

    @Override
    public ModelsMap postProcessModels(ModelsMap objs) {
        List<ModelMap> models = postProcessModelsEnum(objs).getModels();
        for (ModelMap mo : models) {
            CodegenModel cm = mo.getModel();
            cm.imports = new TreeSet<>(cm.imports);
            // Prefix enum names with class name: StatusEnum → PetStatusEnum
            for (CodegenProperty var : cm.vars) {
                if (Boolean.TRUE.equals(var.isEnum))
                    var.datatypeWithEnum = var.datatypeWithEnum.replace(var.enumName, cm.classname + var.enumName);
            }
            if (cm.parent != null) {
                for (CodegenProperty var : cm.allVars) {
                    if (Boolean.TRUE.equals(var.isEnum))
                        var.datatypeWithEnum = var.datatypeWithEnum.replace(var.enumName, cm.classname + var.enumName);
                }
            }
        }
        for (ModelMap mo : models) {
            CodegenModel cm = mo.getModel();
            mo.put("tsImports", toTsImports(cm, cm.imports));
        }
        return objs;
    }

    @Override
    public Map<String, ModelsMap> postProcessAllModels(Map<String, ModelsMap> objs) {
        Map<String, ModelsMap> result = super.postProcessAllModels(objs);
        for (ModelsMap entry : result.values()) {
            for (ModelMap mo : entry.getModels()) {
                CodegenModel cm = mo.getModel();
                if (cm.discriminator != null && cm.children != null) {
                    for (CodegenModel child : cm.children)
                        setDiscriminatorValue(child, cm.discriminator.getPropertyName(), getDiscriminatorValue(child));
                }
            }
        }
        return result;
    }

    // -------------------------------------------------------------------------
    // API / operation post-processing
    // -------------------------------------------------------------------------

    @Override
    public Map<String, Object> postProcessSupportingFileData(Map<String, Object> objs) {
        objs.put("fileContentDataType", additionalProperties.get(FILE_CONTENT_DATA_TYPE));
        return objs;
    }

    @Override
    public OperationsMap postProcessOperationsWithModels(OperationsMap operations, List<ModelMap> models) {
        supportingFiles.add(new SupportingFile("model" + File.separator + "index.mustache",
                modelPackage().replace('.', File.separatorChar), "index.ts"));
        supportingFiles.add(new SupportingFile("api" + File.separator + "index.mustache",
                apiPackage().replace('.', File.separatorChar), "index.ts"));

        // Filter imports and annotate with filename
        List<Map<String, String>> imports = operations.getImports();
        List<Map<String, String>> filteredImports = new ArrayList<>();
        for (Map<String, String> im : imports) {
            String className = im.get("classname");
            if (className != null && className.startsWith("Array<")) continue; // skip, inner type is imported separately
            im.put("filename", im.get("import"));
            filteredImports.add(im);
        }
        operations.put("imports", filteredImports);

        // Fix return types and response dataTypes
        for (CodegenOperation op : operations.getOperations().getOperation()) {
            op.returnType = buildReturnType(op.responses);

            for (CodegenResponse resp : op.responses) {
                if (resp.is2xx && "any".equals(resp.dataType))
                    resp.dataType = null;
            }

            // Fix body param typed as "any" — try to find a matching Request model in imports
            if (op.bodyParam != null && "any".equals(op.bodyParam.dataType)) {
                filteredImports.stream()
                        .map(im -> im.get("classname"))
                        .filter(cn -> cn != null && cn.endsWith("Request"))
                        .findFirst()
                        .ifPresent(cn -> op.bodyParam.dataType = cn);
            }
        }
        return operations;
    }

    // -------------------------------------------------------------------------
    // Import management
    // -------------------------------------------------------------------------

    @Override
    protected void addImport(CodegenModel m, String type) {
        if (type == null) return;
        for (String part : splitComposedType(type)) {
            if (!"null".equals(part) && !"Array".equals(part) && needToImport(part))
                m.imports.add(part);
        }
    }

    @Override
    protected void addImport(Set<String> importsToBeAddedTo, String type) {
        if (type == null) return;
        for (String part : splitComposedType(type)) {
            if (!"null".equals(part) && !"Array".equals(part))
                super.addImport(importsToBeAddedTo, part);
        }
    }

    // -------------------------------------------------------------------------
    // Examples
    // -------------------------------------------------------------------------

    @Override
    public String toExampleValue(Schema schema) {
        return toExampleValue(schema, getObjectExample(schema));
    }

    public String toExampleValue(Schema schema, Object objExample) {
        return toExampleValueRecursive(getModelName(schema), schema, objExample, 1, "", 0, Sets.newHashSet());
    }

    @Override
    public void setParameterExampleValue(CodegenParameter cp, Parameter parameter) {
        Schema schema = parameter.getSchema();
        if (schema == null) return;
        Object example = vendorOrParameterExample(cp, parameter.getExample(), parameter.getExamples());
        if (example == null) example = getObjectExample(schema);
        example = exampleFromStringOrArraySchema(schema, example, parameter.getName());
        cp.example = toExampleValue(schema, example);
    }

    @Override
    public void setParameterExampleValue(CodegenParameter cp, RequestBody requestBody) {
        if (cp.vendorExtensions != null && cp.vendorExtensions.containsKey("x-example")) {
            cp.example = Json.pretty(cp.vendorExtensions.get("x-example"));
        }
        Content content = requestBody.getContent();
        if (content.size() > 1) once(LOGGER).warn("Multiple MediaTypes found, using only the first one");

        MediaType mediaType = content.values().iterator().next();
        Schema schema = mediaType.getSchema();
        if (schema == null) return;

        Object example = vendorOrParameterExample(cp, mediaType.getExample(), mediaType.getExamples());
        if (example == null) example = getObjectExample(schema);
        example = exampleFromStringOrArraySchema(schema, example, cp.paramName);
        cp.example = toExampleValue(schema, example);
    }

    @Override
    public CodegenParameter fromFormProperty(String name, Schema propertySchema, Set<String> imports) {
        CodegenParameter cp = super.fromFormProperty(name, propertySchema, imports);
        Parameter p = new Parameter();
        p.setSchema(propertySchema);
        p.setName(cp.paramName);
        setParameterExampleValue(cp, p);
        return cp;
    }

    // -------------------------------------------------------------------------
    // Misc overrides
    // -------------------------------------------------------------------------

    @Override
    public void processOpts() {
        super.processOpts();
        if (additionalProperties.containsKey(CodegenConstants.MODEL_PROPERTY_NAMING))
            setModelPropertyNaming((String) additionalProperties.get(CodegenConstants.MODEL_PROPERTY_NAMING));
        convertPropertyToBooleanAndWriteBack(CodegenConstants.SUPPORTS_ES6);
        additionalProperties.putIfAbsent(FILE_CONTENT_DATA_TYPE, "Blob");
    }

    @Override
    public String escapeQuotationMark(String input) {
        return input.replace("\"", "").replace("'", "");
    }

    @Override
    public String escapeUnsafeCharacters(String input) {
        return input.replace("*/", "*_/").replace("/*", "/_*");
    }

    // -------------------------------------------------------------------------
    // Model property naming
    // -------------------------------------------------------------------------

    public void setModelPropertyNaming(String naming) {
        if (!Arrays.asList("original", "camelCase", "PascalCase", "snake_case").contains(naming))
            throw new IllegalArgumentException("Invalid model property naming '" + naming + "'");
        this.modelPropertyNaming = naming;
    }

    public String getModelPropertyNaming() { return modelPropertyNaming; }

    public String getNameUsingModelPropertyNaming(String name) {
        switch (CodegenConstants.MODEL_PROPERTY_NAMING_TYPE.valueOf(getModelPropertyNaming())) {
            case original:   return name;
            case camelCase:  return camelize(name, LOWERCASE_FIRST_LETTER);
            case PascalCase: return camelize(name);
            case snake_case: return underscore(name);
            default: throw new IllegalArgumentException("Invalid model property naming: " + name);
        }
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    /** Returns the 2xx union return type for an operation, or null if none. */
    private String buildReturnType(List<CodegenResponse> responses) {
        Set<String> types = responses.stream()
                .filter(r -> r.is2xx)
                .map(r -> (r.dataType != null && !"any".equals(r.dataType)) ? r.dataType : "void")
                .collect(Collectors.toCollection(LinkedHashSet::new));
        return types.isEmpty() ? null : String.join(" | ", types);
    }

    /** True if the schema has anyOf / oneOf / allOf entries. */
    private boolean hasComposition(Schema p) {
        return (p.getAnyOf() != null && !p.getAnyOf().isEmpty())
                || (p.getOneOf() != null && !p.getOneOf().isEmpty())
                || (p.getAllOf() != null && !p.getAllOf().isEmpty());
    }

    /** True if null is explicitly listed among the composed schemas or via OAS 3.1 types[]. */
    private boolean containsNullSchema(Schema p) {
        List<Schema> candidates = new ArrayList<>();
        if (p.getAnyOf() != null)  candidates.addAll(p.getAnyOf());
        if (p.getOneOf() != null)  candidates.addAll(p.getOneOf());
        if (p instanceof ComposedSchema) {
            ComposedSchema cs = (ComposedSchema) p;
            if (cs.getAnyOf() != null) candidates.addAll(cs.getAnyOf());
            if (cs.getOneOf() != null) candidates.addAll(cs.getOneOf());
        }
        return candidates.stream().anyMatch(this::isNullSchema);
    }

    private boolean isNullSchema(Schema s) {
        return ModelUtils.isNullType(s)
                || "null".equals(s.getType())
                || (s.getTypes() != null && s.getTypes().contains("null"));
    }

    /**
     * Resolves TypeScript types from a list of schemas (for interface union/intersection types).
     * Null type, if present, is appended last.
     */
    protected List<String> getTypesFromSchemas(List<Schema> schemas) {
        List<String> types = new ArrayList<>();
        boolean hasNull = false;

        for (Schema schema : schemas) {
            if (isNullSchema(schema)) {
                hasNull = true;
                if (schema.getTypes() != null && schema.getTypes().size() == 1) continue;
            }

            String type = resolveTypeFromSchema(schema);
            if (type != null && !"AnyType".equals(super.getSchemaType(schema))) {
                types.add(type);
            }
        }

        if (hasNull) types.add("null");
        return types.stream().distinct().collect(Collectors.toList());
    }

    private String resolveTypeFromSchema(Schema schema) {
        // OpenAPI 3.1 types[] — try first
        String fromTypes = schemaTypeFromTypesArray(schema);
        if (fromTypes != null) return fromTypes;

        if (ModelUtils.isStringSchema(schema))  return "string";
        if (ModelUtils.isIntegerSchema(schema)) return "number";
        if (ModelUtils.isNumberSchema(schema))  return "number";
        if (ModelUtils.isBooleanSchema(schema)) return "boolean";
        if (ModelUtils.isArraySchema(schema)) {
            Schema inner = ((ArraySchema) schema).getItems();
            return "Array<" + getSchemaType(inner) + ">";
        }
        if (schema instanceof io.swagger.v3.oas.models.media.JsonSchema
                && schema.getTypes() != null && schema.getTypes().contains("array")) {
            io.swagger.v3.oas.models.media.JsonSchema js = (io.swagger.v3.oas.models.media.JsonSchema) schema;
            Schema items = js.getItems();
            return items != null ? "Array<" + getSchemaType(items) + ">" : "Array<any>";
        }

        String type = getSchemaType(schema);
        String superType = super.getSchemaType(schema);
        if ("AnyType".equals(superType)) return null; // skip AnyType in multi-type unions
        return type;
    }

    /**
     * Returns a TS type from an OpenAPI 3.1 {@code types} array, or null if not applicable.
     * Handles primitive mappings and basic array.
     */
    private String schemaTypeFromTypesArray(Schema p) {
        if (p.getTypes() == null || p.getTypes().isEmpty()) return null;
        for (Object tObj : p.getTypes()) {
            String t = tObj.toString();
            if ("null".equals(t)) continue;
            switch (t) {
                case "string":  return "string";
                case "integer": return "number";
                case "number":  return "number";
                case "boolean": return "boolean";
                case "array": {
                    Schema items = null;
                    if (ModelUtils.isArraySchema(p)) {
                        items = ((ArraySchema) p).getItems();
                    } else if (p instanceof io.swagger.v3.oas.models.media.JsonSchema) {
                        items = ((io.swagger.v3.oas.models.media.JsonSchema) p).getItems();
                    }
                    return items != null ? "Array<" + getSchemaType(items) + ">" : "Array<any>";
                }
            }
        }
        return null;
    }

    private Schema getArrayItems(Schema schema) {
        if (ModelUtils.isArraySchema(schema)) return ((ArraySchema) schema).getItems();
        if (schema instanceof io.swagger.v3.oas.models.media.JsonSchema)
            return ((io.swagger.v3.oas.models.media.JsonSchema) schema).getItems();
        return null;
    }

    /** Returns true if the OAS 3.1 types[] contains the given type string. */
    private boolean hasType(Schema schema, String type) {
        return schema.getTypes() != null && schema.getTypes().contains(type);
    }

    private List<Map<String, String>> toTsImports(CodegenModel cm, Set<String> imports) {
        List<Map<String, String>> tsImports = new ArrayList<>();
        for (String im : imports) {
            if (!im.equals(cm.classname)) {
                Map<String, String> entry = new HashMap<>();
                entry.put("classname", im);
                entry.put("filename", importMapping.getOrDefault(im, toModelImport(im)));
                tsImports.add(entry);
            }
        }
        return tsImports;
    }

    private void setDiscriminatorValue(CodegenModel model, String baseName, String value) {
        for (CodegenProperty prop : model.allVars) {
            if (prop.baseName.equals(baseName)) prop.discriminatorValue = value;
        }
        if (model.children != null) {
            boolean newDisc = model.discriminator != null;
            for (CodegenModel child : model.children)
                setDiscriminatorValue(child, baseName, newDisc ? value : getDiscriminatorValue(child));
        }
    }

    private String getDiscriminatorValue(CodegenModel model) {
        return model.vendorExtensions.containsKey(X_DISCRIMINATOR_TYPE)
                ? (String) model.vendorExtensions.get(X_DISCRIMINATOR_TYPE)
                : model.classname;
    }

    protected String addPrefix(String name, String prefix) {
        return StringUtils.isEmpty(prefix) ? name : prefix + "_" + name;
    }

    protected String addSuffix(String name, String suffix) {
        return StringUtils.isEmpty(suffix) ? name : name + "_" + suffix;
    }

    protected String toTypescriptTypeName(final String name, String safePrefix) {
        ArrayList<String> exceptions = new ArrayList<>(Arrays.asList("\\|", " "));
        String sanName = camelize(sanitizeName(name, "(?![| ])\\W", exceptions));

        if (isReservedWord(sanName) || languageSpecificPrimitives.contains(sanName)) {
            LOGGER.warn("{} cannot be used as model name. Renamed to {}{}", sanName, safePrefix, sanName);
            return safePrefix + sanName;
        }
        if (sanName.matches("^\\d.*")) {
            LOGGER.warn("{} (starts with digit) renamed to {}{}", sanName, safePrefix, sanName);
            return safePrefix + sanName;
        }
        return sanName;
    }

    protected String[] splitComposedType(String type) {
        // Also handle Array<Inner> by recursing on inner type
        if (type.startsWith("Array<")) {
            String inner = type.substring(6, type.length() - 1);
            return splitComposedType(inner);
        }
        return type.replace(" ", "").split("[|&<>]");
    }

    protected String enumValuesToEnumTypeUnion(List<String> values, String dataType) {
        return values.stream()
                .map(v -> toEnumValue(v, dataType))
                .collect(Collectors.joining(" | "));
    }

    protected String numericEnumValuesToEnumTypeUnion(List<Number> values) {
        List<String> strings = values.stream().map(Number::toString).collect(Collectors.toList());
        return enumValuesToEnumTypeUnion(strings, "number");
    }

    /** Returns the first non-null list, or null if both are null/empty. */
    @SafeVarargs
    private static <T> List<T> coalesce(List<T>... lists) {
        for (List<T> list : lists) {
            if (list != null && !list.isEmpty()) return list;
        }
        return null;
    }

    private static <T> List<T> getNonNull(List<T> list) {
        return list != null ? list : Collections.emptyList();
    }

    // -------------------------------------------------------------------------
    // Example generation
    // -------------------------------------------------------------------------

    public String typescriptDate(Object dateValue) {
        String s = dateValue instanceof OffsetDateTime
                ? ((OffsetDateTime) dateValue).format(iso8601Date)
                : dateValue.toString();
        return "new Date('" + s + "').toISOString().split('T')[0];";
    }

    public String typescriptDateTime(Object dateTimeValue) {
        String s = dateTimeValue instanceof OffsetDateTime
                ? ((OffsetDateTime) dateTimeValue).format(iso8601DateTime)
                : dateTimeValue.toString();
        return "new Date('" + s + "')";
    }

    public String getModelName(Schema sc) {
        if (sc.get$ref() != null) {
            Schema unaliased = unaliasSchema(sc);
            if (unaliased.get$ref() != null)
                return toModelName(ModelUtils.getSimpleRef(sc.get$ref()));
        }
        return null;
    }

    protected Object getObjectExample(Schema sc) {
        Schema schema = sc;
        if (sc.get$ref() != null)
            schema = ModelUtils.getSchema(this.openAPI, ModelUtils.getSimpleRef(sc.get$ref()));

        if (ModelUtils.isObjectSchema(schema) || ModelUtils.isMapSchema(schema)
                || ModelUtils.isComposedSchema(schema)) return null;

        if (schema.getExample() != null) return schema.getExample();
        if (schema.getDefault() != null) return schema.getDefault();
        if (schema.getEnum() != null && !schema.getEnum().isEmpty()) return schema.getEnum().get(0);
        return null;
    }

    private Object vendorOrParameterExample(CodegenParameter cp, Object directExample,
                                            Map<String, ?> examples) {
        if (cp.vendorExtensions != null && cp.vendorExtensions.containsKey("x-example"))
            return cp.vendorExtensions.get("x-example");
        if (directExample != null) return directExample;
        if (examples != null && !examples.isEmpty()) {
            Object first = examples.values().iterator().next();
            if (first instanceof io.swagger.v3.oas.models.examples.Example)
                return ((io.swagger.v3.oas.models.examples.Example) first).getValue();
        }
        return null;
    }

    private Boolean simpleStringSchema(Schema schema) {
        Schema sc = schema.get$ref() != null
                ? ModelUtils.getSchema(this.openAPI, ModelUtils.getSimpleRef(schema.get$ref()))
                : schema;
        return ModelUtils.isStringSchema(sc) && !ModelUtils.isDateSchema(sc)
                && !ModelUtils.isDateTimeSchema(sc) && !"Number".equalsIgnoreCase(sc.getFormat())
                && !ModelUtils.isByteArraySchema(sc) && !ModelUtils.isBinarySchema(sc)
                && sc.getPattern() == null;
    }

    private CodegenDiscriminator.MappedModel getDiscriminatorMappedModel(CodegenDiscriminator disc) {
        for (CodegenDiscriminator.MappedModel mm : disc.getMappedModels()) {
            Schema s = getModelNameToSchemaCache().get(mm.getModelName());
            if (ModelUtils.isObjectSchema(s)) return mm;
        }
        return null;
    }

    private String toExampleValueRecursive(String modelName, Schema schema, Object objExample,
                                           int indent, String prefix, int exampleLine,
                                           Set<Schema> seen) {
        final String IND = "  ";
        String cur   = exampleLine == 0 ? "" : IND.repeat(indent);
        String close = IND.repeat(indent);
        String full  = cur + prefix;
        String ex    = objExample != null ? objExample.toString() : null;

        if (seen.contains(schema)) {
            if (modelName != null) return full;
            if (ModelUtils.isNullable(schema)) return full + "null";
            if (ModelUtils.isArraySchema(schema)) return full + "[]";
            return full + "{}";
        }

        if (schema.get$ref() != null) {
            Schema refSchema = ModelUtils.getSchemas(this.openAPI).get(ModelUtils.getSimpleRef(schema.get$ref()));
            if (refSchema == null) return full + "null";
            return toExampleValueRecursive(getModelName(schema), refSchema, objExample, indent, prefix, exampleLine, seen);
        }

        if (ModelUtils.isNullType(schema) || ModelUtils.isAnyType(schema)) return full + "null";

        if (ModelUtils.isBooleanSchema(schema))
            return full + (ex != null && "false".equalsIgnoreCase(ex) ? "false" : "true");

        if (ModelUtils.isDateSchema(schema))
            return full + typescriptDate(ex != null ? ex : "1970-01-01");

        if (ModelUtils.isDateTimeSchema(schema))
            return full + typescriptDateTime(ex != null ? ex : "1970-01-01T00:00:00.00Z");

        if (ModelUtils.isBinarySchema(schema)) {
            String path = ex != null ? ex : "/path/to/file";
            return full + "{ data: Buffer.from(fs.readFileSync('" + path + "', 'utf-8')), name: '" + path + "' }";
        }

        if (ModelUtils.isByteArraySchema(schema))
            return full + (ex != null ? ex : "'YQ=='");

        if (ModelUtils.isStringSchema(schema)) {
            if (ex == null) {
                if ("Number".equalsIgnoreCase(schema.getFormat())) {
                    ex = "2";
                } else if (StringUtils.isNotBlank(schema.getPattern())) {
                    ex = new RgxGen(schema.getPattern()).generate(new Random(18));
                } else if (schema.getMinLength() != null) {
                    ex = "a".repeat(schema.getMinLength().intValue());
                } else if (ModelUtils.isUUIDSchema(schema)) {
                    ex = "046b6c7f-0b8a-43b9-b35d-6489e6daee91";
                } else {
                    ex = "string_example";
                }
            }
            return full + ensureQuotes(ex);
        }

        if (ModelUtils.isIntegerSchema(schema))
            return full + (ex != null ? ex : schema.getMinimum() != null ? schema.getMinimum().toString() : "1");

        if (ModelUtils.isNumberSchema(schema))
            return full + (ex != null ? ex : schema.getMinimum() != null ? schema.getMinimum().toString() : "3.14");

        if (ModelUtils.isArraySchema(schema)) {
            Schema items = ((ArraySchema) schema).getItems();
            String itemModel = getModelName(items);
            if (objExample instanceof Iterable && itemModel == null)
                return full + objExample;
            Set<Schema> newSeen = new HashSet<>(seen);
            newSeen.add(schema);
            return full + "[\n"
                    + toExampleValueRecursive(itemModel, items, objExample, indent + 1, "", exampleLine + 1, newSeen)
                    + ",\n" + close + "]";
        }

        if (ModelUtils.isMapSchema(schema)) {
            Object addProps = schema.getAdditionalProperties();
            if (!(addProps instanceof Schema)) return full + "{}";
            Schema addSchema = (Schema) addProps;
            String key = addSchema.getEnum() != null && !addSchema.getEnum().isEmpty()
                    ? addSchema.getEnum().get(0).toString() : "key";
            Object addEx = exampleFromStringOrArraySchema(addSchema, getObjectExample(addSchema), key);
            Set<Schema> newSeen = new HashSet<>(seen);
            newSeen.add(schema);
            return full + "{\n"
                    + toExampleValueRecursive("\"" + getModelName(addSchema) + "\"", addSchema, addEx,
                    indent + 1, ensureQuotes(key) + ": ", exampleLine + 1, newSeen)
                    + ",\n" + close + "}";
        }

        if (ModelUtils.isComposedSchema(schema)) {
            List<Schema> oneOf = ((ComposedSchema) schema).getOneOf();
            if (oneOf != null && !oneOf.isEmpty())
                return full + toExampleValue(oneOf.get(0));
            return full;
        }

        if (ModelUtils.isObjectSchema(schema)) {
            CodegenDiscriminator disc = createDiscriminator(modelName, schema, openAPI);
            if (disc != null && getDiscriminatorMappedModel(disc) == null) return full + "{}";
            Set<Schema> newSeen = new HashSet<>(seen);
            newSeen.add(schema);
            return exampleForObjectModel(schema, full + "{", "}", null, indent, exampleLine, close, newSeen);
        }

        LOGGER.warn("Type {} not handled properly in toExampleValue", schema.getType());
        return ex;
    }

    private String exampleForObjectModel(Schema schema, String fullPrefix, String closeChars,
                                         CodegenProperty discProp, int indent, int exampleLine,
                                         String closingIndent, Set<Schema> seen) {
        Map<String, Schema> props = schema.getProperties();
        if (props == null || props.isEmpty()) return fullPrefix + closeChars;

        StringBuilder sb = new StringBuilder(fullPrefix).append("\n");
        for (Map.Entry<String, Schema> entry : props.entrySet()) {
            Schema propSchema = entry.getValue();
            boolean readOnly = Boolean.TRUE.equals(propSchema.getReadOnly());
            if (!readOnly && propSchema.get$ref() != null) {
                Schema ref = ModelUtils.getSchema(this.openAPI, ModelUtils.getSimpleRef(propSchema.get$ref()));
                readOnly = ref != null && Boolean.TRUE.equals(ref.getReadOnly());
            }
            if (readOnly) continue;

            String propName = toVarName(entry.getKey());
            String propModel;
            Object propEx;
            if (discProp != null && propName.equals(discProp.name)) {
                propModel = null;
                propEx = discProp.example;
            } else {
                propModel = getModelName(propSchema);
                propEx = exampleFromStringOrArraySchema(propSchema, null, propName);
            }
            sb.append(toExampleValueRecursive(propModel, propSchema, propEx, indent + 1,
                    propName + ": ", exampleLine + 1, seen)).append(",\n");
        }
        sb.append(closingIndent).append(closeChars);
        return sb.toString();
    }

    private Object exampleFromStringOrArraySchema(Schema sc, Object current, String propName) {
        if (current != null) return current;
        Schema schema = sc.get$ref() != null
                ? ModelUtils.getSchema(this.openAPI, ModelUtils.getSimpleRef(sc.get$ref()))
                : sc;
        Object ex = getObjectExample(schema);
        if (ex != null) return ex;
        if (simpleStringSchema(schema)) return propName + "_example";
        if (ModelUtils.isArraySchema(schema)) {
            Schema items = ((ArraySchema) schema).getItems();
            ex = getObjectExample(items);
            if (ex != null) return ex;
            if (simpleStringSchema(items)) return propName + "_example";
        }
        return null;
    }

    private String ensureQuotes(String in) {
        Matcher m = Pattern.compile("\r\n|\r|\n").matcher(in);
        if (m.find()) return "`" + in + "`";
        return in.matches("^['\"].*?['\"]$") ? in : "\"" + in + "\"";
    }

    // addVars override kept to track current model context (used by super)
    CodegenModel currentModel;

    @Override
    protected void addVars(IJsonSchemaValidationProperties m, List<CodegenProperty> vars,
                           Map<String, Schema> properties, Set<String> mandatory) {
        CodegenModel prev = currentModel;
        try {
            currentModel = (m instanceof CodegenModel) ? (CodegenModel) m : null;
            super.addVars(m, vars, properties, mandatory);
        } finally {
            currentModel = prev;
        }
    }
}