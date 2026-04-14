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
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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

	private static final String FILE_CONTENT_DATA_TYPE= "fileContentDataType";
	private static final String FILE_CONTENT_DATA_TYPE_DESC = "Specifies the type to use for the content of a file - i.e. Blob (Browser, Deno) / Buffer (node)";

	private static final String DOMAIN_PROPERTY = "domain";

	protected String modelPropertyNaming = "camelCase";
	protected HashSet<String> languageGenericTypes;

	private DateTimeFormatter iso8601Date = DateTimeFormatter.ISO_DATE;
	private DateTimeFormatter iso8601DateTime = DateTimeFormatter.ISO_DATE_TIME;

	public TsGenerator() {
		super();


		this.generatorMetadata = GeneratorMetadata.newBuilder(generatorMetadata).stability(Stability.EXPERIMENTAL).build();

		outputFolder = "generated-code" + File.separator + "typescript";
		templateDir = "ts-generator";

		supportsInheritance = true;

		// NOTE: TypeScript uses camel cased reserved words, while models are title cased. We don't want lowercase comparisons.
		reservedWords.addAll(Arrays.asList(
			// local variable names used in API methods (endpoints)
			"varLocalPath", "queryParameters", "headerParams", "formParams", "useFormData", "varLocalDeferred",
			"requestOptions", "from",
			// Typescript reserved words
			"abstract", "await", "boolean", "break", "byte", "case", "catch", "char", "class", "const", "constructor", "continue", "debugger", "default", "delete", "do", "double", "else", "enum", "export", "extends", "false", "final", "finally", "float", "for", "function", "goto", "if", "implements", "import", "in", "instanceof", "int", "interface", "let", "long", "native", "new", "null", "package", "private", "protected", "public", "return", "short", "static", "super", "switch", "synchronized", "this", "throw", "transient", "true", "try", "typeof", "var", "void", "volatile", "while", "with", "yield"));

		languageSpecificPrimitives = new HashSet<>(Arrays.asList(
			"string",
			"String",
			"boolean",
			"Boolean",
			"Double",
			"Integer",
			"Long",
			"Float",
			"Object",
			"Array",
			"Date",
			"number",
			"any",
			"File",
			"Error",
			"Map",
			"Set"
		));

		languageGenericTypes = new HashSet<>(Arrays.asList(
			"Array"
		));

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


		cliOptions.add(new CliOption(CodegenConstants.MODEL_PROPERTY_NAMING, CodegenConstants.MODEL_PROPERTY_NAMING_DESC).defaultValue("camelCase"));
		cliOptions.add(new CliOption(CodegenConstants.SUPPORTS_ES6, CodegenConstants.SUPPORTS_ES6_DESC).defaultValue("false"));
		cliOptions.add(new CliOption(FILE_CONTENT_DATA_TYPE, FILE_CONTENT_DATA_TYPE_DESC).defaultValue("Buffer"));
		cliOptions.add(new CliOption(DOMAIN_PROPERTY, "domain of generated apis (for @RegisterService)").defaultValue(""));

		// models
		setModelPackage("model");
		modelTemplateFiles.put("model" + File.separator + "model.mustache", ".ts");

		// api
		setApiPackage("api");
		apiTemplateFiles.put("api" + File.separator + "api.mustache", ".ts");
	}

	@Override
	public String toApiName(String name) {
		if (name.length() == 0) {
			return "DefaultApi";
		}

		if ( name.endsWith("Controller"))
			name = name.replace("Controller", "Service");

		if ( !name.endsWith("Service"))
			name += "Service";

		return camelize(name);
	}

	@Override
	public CodegenType getTag() {
		return CodegenType.CLIENT;
	}


	@Override
	public Map<String, Object> postProcessSupportingFileData(Map<String, Object> objs) {

		objs.put("fileContentDataType", additionalProperties.get(FILE_CONTENT_DATA_TYPE));

		return objs;
	}

	@Override
	public OperationsMap postProcessOperationsWithModels(OperationsMap operations, List<ModelMap> models) {

		// this can't happen in the constructor, because the package names will not yet have been initialized
		supportingFiles.add(new SupportingFile("model" + File.separator + "index.mustache", modelPackage().replace('.', File.separatorChar), "index.ts"));
		supportingFiles.add(new SupportingFile("api" + File.separator + "index.mustache", apiPackage().replace('.', File.separatorChar), "index.ts"));

		// Add additional filename information for model imports in the apis
		List<Map<String, String>> imports = operations.getImports();
		List<Map<String, String>> filteredImports = new ArrayList<>();

		for (Map<String, String> im : imports) {
			String importName = im.get("import");
			String className = im.get("classname");

			// Skip Array types - we only need to import the inner type
			if (className != null && className.startsWith("Array<")) {
				continue;
			}

			im.put("filename", importName);
			filteredImports.add(im);
		}

		operations.put("imports", filteredImports);

		OperationMap operationsMap = operations.getOperations();
		List<CodegenOperation> operationList = operationsMap.getOperation();
		for (CodegenOperation operation: operationList) {
			List<CodegenResponse> responses = operation.responses;
			operation.returnType = this.getReturnType(responses);

			// Clear dataType for responses with empty schemas (any type)
			for (CodegenResponse response: responses) {
				if (response.is2xx && "any".equals(response.dataType)) {
					response.dataType = null;
				}
			}

			// Fix body parameters that were incorrectly typed as "any"
			// This happens when a schema has additionalProperties but also has explicit properties
			if (operation.bodyParam != null && "any".equals(operation.bodyParam.dataType)) {
				// Look through the filtered imports to find a Request model
				for (Map<String, String> im : filteredImports) {
					String importClass = im.get("classname");
					// Request bodies usually end with "Request" or match the operation name
					if (importClass != null && importClass.endsWith("Request")) {
						operation.bodyParam.dataType = importClass;
						break;
					}
				}
			}
		}
		return operations;
	}

	/**
	 * Returns the correct return type based on all 2xx HTTP responses defined for an operation.
	 * @param responses all CodegenResponses defined for one operation
	 * @return TypeScript return type
	 */
	private String getReturnType(List<CodegenResponse> responses) {
		Set<String> returnTypes = new HashSet<>();
		for (CodegenResponse response: responses) {
			if (response.is2xx) {
				if (response.dataType != null && !"any".equals(response.dataType)) {
					returnTypes.add(response.dataType);
				} else {
					returnTypes.add("void");
				}
			}
		}

		if (returnTypes.size() == 0) {
			return null;
		}

		return String.join(" | ", returnTypes);
	}

	@Override
	public String escapeReservedWord(String name) {
		if (this.reservedWordsMappings().containsKey(name)) {
			return this.reservedWordsMappings().get(name);
		}
		return "_" + name;
	}

	@Override
	public String toParamName(String name) {
		// should be the same as variable name
		return toVarName(name);
	}

	@Override
	public String toVarName(String name) {
		// sanitize name
		name = sanitizeName(name);

		if ("_".equals(name)) {
			name = "_u";
		}

		// if it's all upper case, do nothing
		if (name.matches("^[A-Z_]*$")) {
			return name;
		}

		name = getNameUsingModelPropertyNaming(name);

		// for reserved word or word starting with number, append _
		if (isReservedWord(name) || name.matches("^\\d.*")) {
			name = escapeReservedWord(name);
		}

		return name;
	}

	@Override
	public String toModelName(final String name) {
		String fullModelName = name;
		fullModelName = addPrefix(fullModelName, modelNamePrefix);
		fullModelName = addSuffix(fullModelName, modelNameSuffix);
		return toTypescriptTypeName(fullModelName, "Model");
	}

	@Override
	public String toModelImport(String name) {
		// Use `/` instead of `File.Separator`. `File.Separator` is `\` in Windows, which is invalid Typescript.
		// Models are in the same directory, so use relative path
		return "../model/" + toModelName(name);
	}

	protected String addPrefix(String name, String prefix) {
		if (!StringUtils.isEmpty(prefix)) {
			name = prefix + "_" + name;
		}
		return name;
	}

	protected String addSuffix(String name, String suffix) {
		if (!StringUtils.isEmpty(suffix)) {
			name = name + "_" + suffix;
		}

		return name;
	}

	protected String toTypescriptTypeName(final String name, String safePrefix) {
		ArrayList<String> exceptions = new ArrayList<>(Arrays.asList("\\|", " "));
		String sanName = sanitizeName(name, "(?![| ])\\W", exceptions);

		sanName = camelize(sanName);

		// model name cannot use reserved keyword, e.g. return
		// this is unlikely to happen, because we have just camelized the name, while reserved words are usually all lowercase
		if (isReservedWord(sanName)) {
			String modelName = safePrefix + sanName;
			LOGGER.warn("{} (reserved word) cannot be used as model name. Renamed to {}", sanName, modelName);
			return modelName;
		}

		// model name starts with number
		if (sanName.matches("^\\d.*")) {
			String modelName = safePrefix + sanName; // e.g. 200Response => Model200Response
			LOGGER.warn("{} (model name starts with number) cannot be used as model name. Renamed to {}", sanName,
				modelName);
			return modelName;
		}

		if (languageSpecificPrimitives.contains(sanName)) {
			String modelName = safePrefix + sanName;
			LOGGER.warn("{} (model name matches existing language type) cannot be used as a model name. Renamed to {}",
				sanName, modelName);
			return modelName;
		}

		return sanName;
	}

	@Override
	public String toModelFilename(String name) {
		// should be the same as the model name
		return toModelName(name);
	}


	// TODO remove if not needed anymore

	@Override
	public void postProcessModelProperty(CodegenModel model, CodegenProperty property) {
		super.postProcessModelProperty(model, property);

		if (property.isInnerEnum && property.items != null) {
// format maps of inner enums to include the classname eg: Dictionary<string, MapTest.InnerEnum>
			//property.datatypeWithEnum = property.datatypeWithEnum.replace(property.items.datatypeWithEnum, model.classname + "." + property.items.datatypeWithEnum);
			//property.dataType = property.datatypeWithEnum;

			//property.datatypeWithEnum = model.classname + property.datatypeWithEnum;
		}
	}

	// TODO remove if not needed anymore
	public void postProcessParameter(CodegenParameter parameter) {
		super.postProcessParameter(parameter);

		/*
		if ( parameter.dataType.contains("|")) {
			if (parameter.isString)
				parameter.dataType = "string";

			parameter.vendorExtensions.put("serialize-dataType", "string");
		}
		else
			parameter.vendorExtensions.put("serialize-dataType",  parameter.dataType);*/
	}

    @Override
    protected String getParameterDataType(Parameter parameter, Schema p) {
        Schema inner;

        // Handle composed schemas first
        if (ModelUtils.isComposedSchema(p)) {
            return getSchemaType(p);
        }

        if (ModelUtils.isArraySchema(p)) {
            ArraySchema mp1 = (ArraySchema) p;
            inner = mp1.getItems();
            return this.getSchemaType(p) + "<" + this.getParameterDataType(parameter, inner) + ">";
        } else if (ModelUtils.isMapSchema(p)) {
            inner = (Schema) p.getAdditionalProperties();
            return "{ [key: string]: " + this.getParameterDataType(parameter, inner) + "; }";
        } else if (ModelUtils.isStringSchema(p)) {
            if (p.getEnum() != null) {
                return enumValuesToEnumTypeUnion(p.getEnum(), "string");
            }
        } else if (ModelUtils.isIntegerSchema(p)) {
            if (p.getEnum() != null) {
                return numericEnumValuesToEnumTypeUnion(new ArrayList<Number>(p.getEnum()));
            }
        } else if (ModelUtils.isNumberSchema(p)) {
            if (p.getEnum() != null) {
                return numericEnumValuesToEnumTypeUnion(new ArrayList<Number>(p.getEnum()));
            }
        }

        String type = this.getTypeDeclaration(p);

        if (type.equals("any")) {
            System.out.println("### Parameter: " + parameter.getName() + " has type " + type);
        }

        return type;
    }

	/**
	 * Converts a list of strings to a literal union for representing enum values as a type.
	 * Example output: 'available' | 'pending' | 'sold'
	 *
	 * @param values   list of allowed enum values
	 * @param dataType either "string" or "number"
	 * @return a literal union for representing enum values as a type
	 */
	protected String enumValuesToEnumTypeUnion(List<String> values, String dataType) {
		StringBuilder b = new StringBuilder();
		boolean isFirst = true;
		for (String value : values) {
			if (!isFirst) {
				b.append(" | ");
			}
			b.append(toEnumValue(value, dataType));
			isFirst = false;
		}
		return b.toString();
	}

	/**
	 * Converts a list of numbers to a literal union for representing enum values as a type.
	 * Example output: 3 | 9 | 55
	 *
	 * @param values a list of numbers
	 * @return a literal union for representing enum values as a type
	 */
	protected String numericEnumValuesToEnumTypeUnion(List<Number> values) {
		List<String> stringValues = new ArrayList<>();
		for (Number value : values) {
			stringValues.add(value.toString());
		}
		return enumValuesToEnumTypeUnion(stringValues, "number");
	}

	@Override
	public String toDefaultValue(Schema p) {
		if (ModelUtils.isBooleanSchema(p)) {
			return UNDEFINED_VALUE;
		} else if (ModelUtils.isDateSchema(p)) {
			return UNDEFINED_VALUE;
		} else if (ModelUtils.isDateTimeSchema(p)) {
			return UNDEFINED_VALUE;
		} else if (ModelUtils.isNumberSchema(p)) {
			if (p.getDefault() != null) {
				return p.getDefault().toString();
			}
			return UNDEFINED_VALUE;
		} else if (ModelUtils.isIntegerSchema(p)) {
			if (p.getDefault() != null) {
				return p.getDefault().toString();
			}
			return UNDEFINED_VALUE;
		} else if (ModelUtils.isStringSchema(p)) {
			if (p.getDefault() != null) {
				return "'" + (String) p.getDefault() + "'";
			}
			return UNDEFINED_VALUE;
		} else {
			return UNDEFINED_VALUE;
		}

	}

	@Override
	protected boolean isReservedWord(String word) {
		// NOTE: This differs from super's implementation in that TypeScript does _not_ want case insensitive matching.
		return reservedWords.contains(word);
	}

    @Override
    public String getSchemaType(Schema p) {
        String openAPIType = super.getSchemaType(p);
        String type = null;

        LOGGER.info("getSchemaType: openAPIType={}, $ref={}, title={}, hasProperties={}, additionalProperties={}",
            openAPIType,
            p.get$ref(),
            p.getTitle(),
            p.getProperties() != null && !p.getProperties().isEmpty(),
            p.getAdditionalProperties());

        // If the schema has properties but was resolved to a map type, return the model name instead
        if ("any".equals(openAPIType) && p.getProperties() != null && !p.getProperties().isEmpty()) {
            // This is an object model, try to get the model name from the title
            if (p.getTitle() != null && !p.getTitle().isEmpty()) {
                String modelName = toModelName(p.getTitle());
                LOGGER.info("Converted 'any' to model name: {}", modelName);
                return modelName;
            }
        }

        // Handle anyOf/oneOf/allOf at property level (OpenAPI 3.1 JsonSchema)
        if (p.getAnyOf() != null && !p.getAnyOf().isEmpty()) {
            List<String> types = getTypesFromSchemas(p.getAnyOf());
            return String.join(" | ", types);
        }

        if (p.getOneOf() != null && !p.getOneOf().isEmpty()) {
            List<String> types = getTypesFromSchemas(p.getOneOf());
            return String.join(" | ", types);
        }

        if (p.getAllOf() != null && !p.getAllOf().isEmpty()) {
            List<String> types = getTypesFromSchemas(p.getAllOf());
            return String.join(" & ", types);
        }

        if (ModelUtils.isComposedSchema(p)) {
            ComposedSchema cs = (ComposedSchema) p;

            if (cs.getAnyOf() != null && !cs.getAnyOf().isEmpty()) {
                List<String> types = getTypesFromSchemas(cs.getAnyOf());
                return String.join(" | ", types);
            }

            if (cs.getOneOf() != null && !cs.getOneOf().isEmpty()) {
                List<String> types = getTypesFromSchemas(cs.getOneOf());
                return String.join(" | ", types);
            }

            if (cs.getAllOf() != null && !cs.getAllOf().isEmpty()) {
                List<String> types = getTypesFromSchemas(cs.getAllOf());
                return String.join(" & ", types);
            }
        }

        // Handle OpenAPI 3.1 types property
        if (p.getTypes() != null && !p.getTypes().isEmpty()) {
            for (Object tObj : p.getTypes()) {
                String t = tObj.toString();
                if (!"null".equals(t)) {
                    if ("string".equals(t)) return "string";
                    if ("integer".equals(t)) return "number";
                    if ("number".equals(t)) return "number";
                    if ("boolean".equals(t)) return "boolean";
                    if ("array".equals(t)) {
                        // OpenAPI 3.1 array handling - try to access items via extensions
                        Schema items = null;
                        if (p.getExtensions() != null && p.getExtensions().containsKey("items")) {
                            Object itemsObj = p.getExtensions().get("items");
                            if (itemsObj instanceof Schema) {
                                items = (Schema) itemsObj;
                            }
                        }
                        // Also try the JSON schema way via getJsonSchema (if available)
                        if (items == null && p instanceof io.swagger.v3.oas.models.media.JsonSchema) {
                            io.swagger.v3.oas.models.media.JsonSchema jsonSchema = (io.swagger.v3.oas.models.media.JsonSchema) p;
                            items = jsonSchema.getItems();
                        }
                        if (items != null) {
                            return "Array<" + getSchemaType(items) + ">";
                        }
                        return "Array<any>";
                    }
                }
            }
        }

        // Handle primitive types explicitly
        if (ModelUtils.isStringSchema(p)) return "string";
        if (ModelUtils.isIntegerSchema(p)) return "number";
        if (ModelUtils.isNumberSchema(p)) return "number";
        if (ModelUtils.isBooleanSchema(p)) return "boolean";

        if (typeMapping.containsKey(openAPIType)) {
            type = typeMapping.get(openAPIType);
            if (languageSpecificPrimitives.contains(type))
                return type;
        } else {
            type = openAPIType;
        }

        return toModelName(type);
    }

	@Override
	public String toOperationId(String operationId) {
		// throw exception if method name is empty
		if (StringUtils.isEmpty(operationId)) {
			throw new RuntimeException("Empty method name (operationId) not allowed");
		}

		// method name cannot use reserved keyword, e.g. return
		// append _ at the beginning, e.g. _return
		if (isReservedWord(operationId)) {
			return escapeReservedWord(camelize(sanitizeName(operationId), LOWERCASE_FIRST_LETTER));
		}

		return camelize(sanitizeName(operationId), LOWERCASE_FIRST_LETTER);
	}

	public void setModelPropertyNaming(String naming) {
		if ("original".equals(naming) || "camelCase".equals(naming) ||
			"PascalCase".equals(naming) || "snake_case".equals(naming)) {
			this.modelPropertyNaming = naming;
		} else {
			throw new IllegalArgumentException("Invalid model property naming '" +
				naming + "'. Must be 'original', 'camelCase', " +
				"'PascalCase' or 'snake_case'");
		}
	}

	public String getModelPropertyNaming() {
		return this.modelPropertyNaming;
	}

	public String getNameUsingModelPropertyNaming(String name) {
		switch (CodegenConstants.MODEL_PROPERTY_NAMING_TYPE.valueOf(getModelPropertyNaming())) {
			case original:
				return name;
			case camelCase:
				return camelize(name, LOWERCASE_FIRST_LETTER);
			case PascalCase:
				return camelize(name);
			case snake_case:
				return underscore(name);
			default:
				throw new IllegalArgumentException("Invalid model property naming '" +
					name + "'. Must be 'original', 'camelCase', " +
					"'PascalCase' or 'snake_case'");
		}

	}

	@Override
	public String toEnumValue(String value, String datatype) {
		if ("number".equals(datatype)) {
			return value;
		} else {
			return "\'" + escapeText(value) + "\'";
		}
	}

	@Override
	public String toEnumDefaultValue(String value, String datatype) {
		return datatype + "_" + value;
	}

	@Override
	public String toEnumVarName(String name, String datatype) {
		if (name.length() == 0) {
			return "Empty";
		}

		// for symbol, e.g. $, #
		if (getSymbolName(name) != null) {
			return camelize(getSymbolName(name));
		}

		// number
		if ("number".equals(datatype)) {
			String varName = "NUMBER_" + name;

			varName = varName.replaceAll("-", "MINUS_");
			varName = varName.replaceAll("\\+", "PLUS_");
			varName = varName.replaceAll("\\.", "_DOT_");
			return varName;
		}

		// string
		String enumName = sanitizeName(name);
		enumName = enumName.replaceFirst("^_", "");
		enumName = enumName.replaceFirst("_$", "");

		// camelize the enum variable name
		// ref: https://basarat.gitbooks.io/typescript/content/docs/enums.html
		//enumName = camelize(enumName);

		// NEW

		StringBuilder builder = new StringBuilder();
		boolean upperCase = true;
		for (int i = 0; i < enumName.length(); i++) {
			char ch = enumName.charAt(i);
			if ( Character.isUpperCase(ch)) {
				if (!upperCase) {
					if (i > 0 && enumName.charAt(i-1) != '_')
						builder.append("_");

					upperCase = true;
				}

				builder.append(Character.toUpperCase(ch));
			}
			else {
				builder.append(Character.toUpperCase(ch));
				upperCase = false;

			}
		} // for

		enumName = builder.toString();

		// NEW

		if (enumName.matches("\\d.*")) { // starts with number
			return "_" + enumName;
		} else {
			return enumName;
		}
	}

	@Override
	public String toEnumName(CodegenProperty property) {
		String enumName = toModelName(property.name) + "Enum";

		if (enumName.matches("\\d.*")) { // starts with number
			return "_" + enumName;
		} else {
			return enumName;
		}
	}

	@Override
	public ModelsMap postProcessModels(ModelsMap objs) {
		// process enum in models
		List<ModelMap> models = postProcessModelsEnum(objs).getModels();
		for (ModelMap mo : models) {
			CodegenModel cm = mo.getModel();
			cm.imports = new TreeSet<>(cm.imports);
			// name enum with model name, e.g. StatusEnum => Pet.StatusEnum
			for (CodegenProperty var : cm.vars) {
				if (Boolean.TRUE.equals(var.isEnum)) {
					var.datatypeWithEnum = var.datatypeWithEnum.replace(var.enumName, cm.classname + var.enumName);
				}
			}
			if (cm.parent != null) {
				for (CodegenProperty var : cm.allVars) {
					if (Boolean.TRUE.equals(var.isEnum)) {
						var.datatypeWithEnum = var.datatypeWithEnum
							.replace(var.enumName, cm.classname + var.enumName);
					}
				}
			}
		}
		for (ModelMap mo : models) {
			CodegenModel cm = mo.getModel();
			// Add additional filename information for imports
			mo.put("tsImports", toTsImports(cm, cm.imports));
		}
		return objs;
	}

	private List<Map<String, String>> toTsImports(CodegenModel cm, Set<String> imports) {
		List<Map<String, String>> tsImports = new ArrayList<>();
		for (String im : imports) {
			if (!im.equals(cm.classname)) {
				HashMap<String, String> tsImport = new HashMap<>();
				// TVG: This is used as class name in the import statements of the model file
				tsImport.put("classname", im);
				tsImport.put("filename", importMapping.getOrDefault(im, toModelImport(im)));
				tsImports.add(tsImport);
			}
		}
		return tsImports;
	}

	@Override
	public Map<String, ModelsMap> postProcessAllModels(Map<String, ModelsMap> objs) {
		Map<String, ModelsMap> result = super.postProcessAllModels(objs);

		for (ModelsMap entry : result.values()) {
			for (ModelMap mo : entry.getModels()) {
				CodegenModel cm = mo.getModel();
				if (cm.discriminator != null && cm.children != null) {
					for (CodegenModel child : cm.children) {
						this.setDiscriminatorValue(child, cm.discriminator.getPropertyName(), this.getDiscriminatorValue(child));
					}
				}
			}
		}
		return result;
	}

	private void setDiscriminatorValue(CodegenModel model, String baseName, String value) {
		for (CodegenProperty prop : model.allVars) {
			if (prop.baseName.equals(baseName)) {
				prop.discriminatorValue = value;
			}
		}
		if (model.children != null) {
			final boolean newDiscriminator = model.discriminator != null;
			for (CodegenModel child : model.children) {
				this.setDiscriminatorValue(child, baseName, newDiscriminator ? value : this.getDiscriminatorValue(child));
			}
		}
	}

	private String getDiscriminatorValue(CodegenModel model) {
		return model.vendorExtensions.containsKey(X_DISCRIMINATOR_TYPE) ?
			(String) model.vendorExtensions.get(X_DISCRIMINATOR_TYPE) : model.classname;
	}

	@Override
	public String escapeQuotationMark(String input) {
		// remove ', " to avoid code injection
		return input.replace("\"", "").replace("'", "");
	}

	@Override
	public String escapeUnsafeCharacters(String input) {
		return input.replace("*/", "*_/").replace("/*", "/_*");
	}

	@Override
	public String getName() {
		return "ts-generator";
	}

	@Override
	public String getHelp() {
		return "Custom generator plugin for OpenAPI Generator to fit our code style";
	}


	@Override
	public void processOpts() {
		super.processOpts();

		if (additionalProperties.containsKey(CodegenConstants.MODEL_PROPERTY_NAMING)) {
			setModelPropertyNaming((String) additionalProperties.get(CodegenConstants.MODEL_PROPERTY_NAMING));
		}

		convertPropertyToBooleanAndWriteBack(CodegenConstants.SUPPORTS_ES6);

		additionalProperties.putIfAbsent(FILE_CONTENT_DATA_TYPE, "Blob");

	}


	CodegenModel currentModel;

	protected void addVars(IJsonSchemaValidationProperties m, List<CodegenProperty> vars, Map<String, Schema> properties, Set<String> mandatory) {
		CodegenModel previousModel = currentModel;

		try {
			if (m instanceof CodegenModel) {
				currentModel = (CodegenModel) m;
			}
			else currentModel = null;

			super.addVars(m, vars, properties, mandatory);
		}
		finally {
			currentModel = previousModel;
		}

	}

    @Override
    public CodegenProperty fromProperty(String name, Schema p, boolean required, boolean schemaIsFromAdditionalProperties) {
        CodegenProperty property = super.fromProperty(name, p, required, schemaIsFromAdditionalProperties);

        // Check for anyOf/oneOf/allOf at property level (OpenAPI 3.1 JsonSchema)
        boolean hasComposition = (p.getAnyOf() != null && !p.getAnyOf().isEmpty()) ||
                                 (p.getOneOf() != null && !p.getOneOf().isEmpty()) ||
                                 (p.getAllOf() != null && !p.getAllOf().isEmpty());

        // Check if the schema actually contains null
        boolean actuallyNullable = false;
        if (hasComposition || ModelUtils.isComposedSchema(p)) {
            List<Schema> schemas = null;
            if (p.getAnyOf() != null && !p.getAnyOf().isEmpty()) {
                schemas = p.getAnyOf();
            } else if (p.getOneOf() != null && !p.getOneOf().isEmpty()) {
                schemas = p.getOneOf();
            } else if (ModelUtils.isComposedSchema(p)) {
                ComposedSchema cs = (ComposedSchema) p;
                if (cs.getAnyOf() != null && !cs.getAnyOf().isEmpty()) {
                    schemas = cs.getAnyOf();
                } else if (cs.getOneOf() != null && !cs.getOneOf().isEmpty()) {
                    schemas = cs.getOneOf();
                }
            }

            if (schemas != null) {
                for (Schema s : schemas) {
                    if (ModelUtils.isNullType(s) ||
                        (s.getType() != null && "null".equals(s.getType())) ||
                        (s.getTypes() != null && s.getTypes().contains("null"))) {
                        actuallyNullable = true;
                        break;
                    }
                }
            }
        }

        // Override dataType for composed schemas OR if super returned "any" for basic types
        if (ModelUtils.isComposedSchema(p) || hasComposition || "any".equals(property.dataType)) {
            String composedType = getSchemaType(p);
            if (composedType != null && !composedType.isEmpty()) {
                // If the type includes " | null", remove it since we handle nullable separately
                if (actuallyNullable && composedType.endsWith(" | null")) {
                    composedType = composedType.substring(0, composedType.length() - 7);
                }
                property.dataType = composedType;
                property.datatypeWithEnum = composedType;
            }
        }

        // Fix OpenAPI 3.1 parser incorrectly marking all properties as nullable
        property.isNullable = actuallyNullable;

        // Handle inline enums - convert to union types instead of enum classes
        if (property.isEnum && property._enum != null && !property._enum.isEmpty()) {
            List<String> enumValues = new ArrayList<>();
            for (Object enumValue : property._enum) {
                enumValues.add("'" + enumValue.toString() + "'");
            }
            String unionType = String.join(" | ", enumValues);
            property.datatypeWithEnum = unionType;
            property.dataType = unionType;
        }

        // Handle base type
        String baseType = property.baseType.equals("Date") ? "date" : property.baseType;

        if (property.dataType.equals(baseType))
            property.vendorExtensions.put("base-type", "");
        else
            property.vendorExtensions.put("base-type", baseType + "()");

        // Add custom variables for schema types
        String schemaTypeDeclaration = getSchemaTypeDeclaration(property, p);
        property.vendorExtensions.put("schema-type", schemaTypeDeclaration);

        return property;
    }

    // New helper method to determine schema type declaration
    private String getSchemaTypeDeclaration(CodegenProperty property, Schema schema) {
        // Handle anyOf/oneOf at property level (OpenAPI 3.1 JsonSchema)
        List<Schema> schemas = null;
        if (schema.getAnyOf() != null && !schema.getAnyOf().isEmpty()) {
            schemas = schema.getAnyOf();
        } else if (schema.getOneOf() != null && !schema.getOneOf().isEmpty()) {
            schemas = schema.getOneOf();
        } else if (ModelUtils.isComposedSchema(schema)) {
            // Handle composite schemas (anyOf, oneOf, allOf)
            ComposedSchema cs = (ComposedSchema) schema;
            if (cs.getAnyOf() != null && !cs.getAnyOf().isEmpty()) {
                schemas = cs.getAnyOf();
            } else if (cs.getOneOf() != null && !cs.getOneOf().isEmpty()) {
                schemas = cs.getOneOf();
            }
        }

        if (schemas != null) {
            List<String> schemaTypes = new ArrayList<>();
            boolean hasNull = false;

            for (Schema s : schemas) {
                // Check for null using OpenAPI 3.1 types property
                boolean isNull = ModelUtils.isNullType(s) ||
                        (s.getType() != null && "null".equals(s.getType())) ||
                        (s.getTypes() != null && s.getTypes().contains("null"));

                if (isNull) {
                    hasNull = true;
                } else {
                    String typeDec = getSingleSchemaTypeDeclaration(s);
                    if (typeDec != null) {
                        schemaTypes.add(typeDec);
                    }
                }
            }

            if (schemaTypes.isEmpty()) {
                return property.baseType + "()";
            }

            String result = schemaTypes.size() == 1
                    ? schemaTypes.get(0)
                    : "anyOf([" + String.join(", ", schemaTypes) + "])";

            return hasNull ? result + ".optional().nullable()" : result;
        }

        return getSingleSchemaTypeDeclaration(schema);
    }

    // Helper method to get schema type declaration for a single schema
    private String getSingleSchemaTypeDeclaration(Schema schema) {
        // Check for OpenAPI 3.1 array type
        boolean isArray = ModelUtils.isArraySchema(schema) ||
                         (schema.getTypes() != null && schema.getTypes().contains("array"));

        if (isArray) {
            Schema items = null;
            if (ModelUtils.isArraySchema(schema)) {
                ArraySchema arraySchema = (ArraySchema) schema;
                items = arraySchema.getItems();
            } else {
                // OpenAPI 3.1: try to get items from JsonSchema
                if (schema instanceof io.swagger.v3.oas.models.media.JsonSchema) {
                    io.swagger.v3.oas.models.media.JsonSchema jsonSchema = (io.swagger.v3.oas.models.media.JsonSchema) schema;
                    items = jsonSchema.getItems();
                }
            }

            if (items != null) {
                if (items.get$ref() != null) {
                    String refName = ModelUtils.getSimpleRef(items.get$ref());
                    return "array(" + toModelName(refName) + "Schema)";
                } else {
                    String itemType = getSchemaType(items);
                    // Check if it's a primitive type
                    if ("string".equals(itemType) || "number".equals(itemType) || "boolean".equals(itemType)) {
                        return "array(" + itemType + "())";
                    } else {
                        // It's a reference or complex type
                        return "array(" + itemType + "Schema)";
                    }
                }
            }
            return "array(any())";
        }
        else if (ModelUtils.isMapSchema(schema)) {
            Schema additionalProps = (Schema) schema.getAdditionalProperties();
            if (additionalProps != null && additionalProps.get$ref() != null) {
                String refName = ModelUtils.getSimpleRef(additionalProps.get$ref());
                return "record(" + toModelName(refName) + "Schema)";
            }
            else if (additionalProps != null) {
                String itemType = getSchemaType(additionalProps);
                return "record(" + itemType + "())";
            }
            return "record(string())";
        }
        else if (schema.get$ref() != null) {
            String refName = ModelUtils.getSimpleRef(schema.get$ref());
            return "reference(" + toModelName(refName) + "Schema)";
        }
        else if (schema.getEnum() != null && !schema.getEnum().isEmpty()) {
            // Handle inline enums - generate oneOf with literal values
            List<String> enumValues = new ArrayList<>();
            for (Object enumValue : schema.getEnum()) {
                enumValues.add("'" + enumValue.toString() + "'");
            }
            return "oneOf(" + String.join(", ", enumValues) + ")";
        }
        else if (ModelUtils.isStringSchema(schema)) {
            return "string()";
        }
        else if (ModelUtils.isIntegerSchema(schema)) {
            return "number()";
        }
        else if (ModelUtils.isNumberSchema(schema)) {
            return "number()";
        }
        else if (ModelUtils.isBooleanSchema(schema)) {
            return "boolean()";
        }
        else if (ModelUtils.isDateSchema(schema)) {
            return "date()";
        }
        else if (ModelUtils.isDateTimeSchema(schema)) {
            return "date()";
        }
        else {
            String type = getSchemaType(schema);
            if ("Date".equals(type)) {
                return "date()";
            }
            return type + "()";
        }
    }

	@Override
	public String getTypeDeclaration(Schema p) {
		Schema inner;

		// Check for $ref first - these should be treated as model references, not maps
		if (p.get$ref() != null) {
			return super.getTypeDeclaration(p);
		}

		if (ModelUtils.isArraySchema(p)) {
			inner = ((ArraySchema) p).getItems();
			return this.getSchemaType(p) + "<" + this.getTypeDeclaration(unaliasSchema(inner)) + ">";
		} else if (ModelUtils.isMapSchema(p)) {
			// If the schema has explicit properties, it's an object model, not a pure map
			// even if it also has additionalProperties
			if (p.getProperties() != null && !p.getProperties().isEmpty()) {
				return super.getTypeDeclaration(p);
			}
			inner = getSchemaAdditionalProperties(p);
			String postfix = "";
			if (Boolean.TRUE.equals(inner.getNullable())) {
				postfix = " | null";
			}
			return "{ [key: string]: " + this.getTypeDeclaration(unaliasSchema(inner)) + postfix + "; }";
		} else if (ModelUtils.isFileSchema(p)) {
			return "HttpFile";
		} else if (ModelUtils.isBinarySchema(p)) {
			return "any";
		} else {
			return super.getTypeDeclaration(p);
		}
	}

	@Override
	protected void addAdditionPropertiesToCodeGenModel(CodegenModel codegenModel, Schema schema) {
		codegenModel.additionalPropertiesType = getTypeDeclaration((Schema) schema.getAdditionalProperties());
		addImport(codegenModel, codegenModel.additionalPropertiesType);
	}

	public String typescriptDate(Object dateValue) {
		String strValue = null;
		if (dateValue instanceof OffsetDateTime) {
			OffsetDateTime date = null;
			try {
				date = (OffsetDateTime) dateValue;
			} catch (ClassCastException e) {
				LOGGER.warn("Invalid `date` format for value {}", dateValue);
				date = ((Date) dateValue).toInstant().atOffset(ZoneOffset.UTC);
			}
			strValue = date.format(iso8601Date);
		} else {
			strValue = dateValue.toString();
		}
		return "new Date('" + strValue + "').toISOString().split('T')[0];";
	}

	public String typescriptDateTime(Object dateTimeValue) {
		String strValue = null;
		if (dateTimeValue instanceof OffsetDateTime) {
			OffsetDateTime dateTime = null;
			try {
				dateTime = (OffsetDateTime) dateTimeValue;
			} catch (ClassCastException e) {
				LOGGER.warn("Invalid `date-time` format for value {}", dateTimeValue);
				dateTime = ((Date) dateTimeValue).toInstant().atOffset(ZoneOffset.UTC);
			}
			strValue = dateTime.format(iso8601DateTime);
		} else {
			strValue = dateTimeValue.toString();
		}
		return "new Date('" + strValue + "')";
	}

	public String getModelName(Schema sc) {
		if (sc.get$ref() != null) {
			Schema unaliasedSchema = unaliasSchema(sc);
			if (unaliasedSchema.get$ref() != null) {
				return toModelName(ModelUtils.getSimpleRef(sc.get$ref()));
			}
		}
		return null;
	}

	/**
	 * Gets an example if it exists
	 *
	 * @param sc input schema
	 * @return the example value
	 */
	protected Object getObjectExample(Schema sc) {
		Schema schema = sc;
		String ref = sc.get$ref();
		if (ref != null) {
			schema = ModelUtils.getSchema(this.openAPI, ModelUtils.getSimpleRef(ref));
		}
		// TODO handle examples in object models in the future
		Boolean objectModel = (ModelUtils.isObjectSchema(schema) || ModelUtils.isMapSchema(schema) || ModelUtils.isComposedSchema(schema));
		if (objectModel) {
			return null;
		}
		if (schema.getExample() != null) {
			return schema.getExample();
		}
		if (schema.getDefault() != null) {
			return schema.getDefault();
		} else if (schema.getEnum() != null && !schema.getEnum().isEmpty()) {
			return schema.getEnum().get(0);
		}
		return null;
	}

	/***
	 * Ensures that the string has a leading and trailing quote
	 *
	 * @param in input string
	 * @return quoted string
	 */
	private String ensureQuotes(String in) {
		Pattern pattern = Pattern.compile("\r\n|\r|\n");
		Matcher matcher = pattern.matcher(in);
		if (matcher.find()) {
			// if a string has a new line in it add backticks to make it a typescript multiline string
			return "`" + in + "`";
		}
		String strPattern = "^['\"].*?['\"]$";
		if (in.matches(strPattern)) {
			return in;
		}
		return "\"" + in + "\"";
	}

	@Override
	public String toExampleValue(Schema schema) {
		Object objExample = getObjectExample(schema);
		return toExampleValue(schema, objExample);
	}

	public String toExampleValue(Schema schema, Object objExample) {
		String modelName = getModelName(schema);
		return toExampleValueRecursive(modelName, schema, objExample, 1, "", 0, Sets.newHashSet());
	}

	private Boolean simpleStringSchema(Schema schema) {
		Schema sc = schema;
		String ref = schema.get$ref();
		if (ref != null) {
			sc = ModelUtils.getSchema(this.openAPI, ModelUtils.getSimpleRef(ref));
		}
		return ModelUtils.isStringSchema(sc) && !ModelUtils.isDateSchema(sc) && !ModelUtils.isDateTimeSchema(sc) && !"Number".equalsIgnoreCase(sc.getFormat()) && !ModelUtils.isByteArraySchema(sc) && !ModelUtils.isBinarySchema(sc) && schema.getPattern() == null;
	}

	private CodegenDiscriminator.MappedModel getDiscriminatorMappedModel(CodegenDiscriminator disc) {
		for (CodegenDiscriminator.MappedModel mm : disc.getMappedModels()) {
			String modelName = mm.getModelName();
			Schema modelSchema = getModelNameToSchemaCache().get(modelName);
			if (ModelUtils.isObjectSchema(modelSchema)) {
				return mm;
			}
		}
		return null;
	}

	/***
	 * Recursively generates string examples for schemas
	 *
	 * @param modelName the string name of the refed model that will be generated for the schema or null
	 * @param schema the schema that we need an example for
	 * @param objExample the example that applies to this schema, for now only string example are used
	 * @param indentationLevel integer indentation level that we are currently at
	 *                         we assume the indentation amount is 2 spaces times this integer
	 * @param prefix the string prefix that we will use when assigning an example for this line
	 *               this is used when setting key: value, pairs "key: " is the prefix
	 *               and this is used when setting properties like some_property='some_property_example'
	 * @param exampleLine this is the current line that we are generating an example for, starts at 0
	 *                    we don't indent the 0th line because using the example value looks like:
	 *                    prop = ModelName( line 0
	 *                        some_property='some_property_example' line 1
	 *                    ) line 2
	 *                    and our example value is:
	 *                    ModelName( line 0
	 *                        some_property='some_property_example' line 1
	 *                    ) line 2
	 * @param seenSchemas This set contains all the schemas passed into the recursive function. It is used to check
	 *                    if a schema was already passed into the function and breaks the infinite recursive loop. The
	 *                    only schemas that are not added are ones that contain $ref != null
	 * @return the string example
	 */
	private String toExampleValueRecursive(String modelName, Schema schema, Object objExample, int indentationLevel, String prefix, Integer exampleLine, Set<Schema> seenSchemas) {
		final String indentionConst = "  ";
		String currentIndentation = "";
		String closingIndentation = "";
		for (int i = 0; i < indentationLevel; i++) currentIndentation += indentionConst;
		if (exampleLine.equals(0)) {
			closingIndentation = currentIndentation;
			currentIndentation = "";
		} else {
			closingIndentation = currentIndentation;
		}
		String openChars = "";
		String closeChars = "";
		String fullPrefix = currentIndentation + prefix + openChars;

		String example = null;
		if (objExample != null) {
			example = objExample.toString();
		}
		// checks if the current schema has already been passed in. If so, breaks the current recursive pass
		if (seenSchemas.contains(schema)) {
			if (modelName != null) {
				return fullPrefix + closeChars;
			} else {
				// this is a recursive schema
				// need to add a reasonable example to avoid
				// infinite recursion
				if (ModelUtils.isNullable(schema)) {
					// if the schema is nullable, then 'null' is a valid value
					return fullPrefix + "null" + closeChars;
				} else if (ModelUtils.isArraySchema(schema)) {
					// the schema is an array, add an empty array
					return fullPrefix + "[]" + closeChars;
				} else {
					// the schema is an object, make an empty object
					return fullPrefix + "{}" + closeChars;
				}
			}
		}

		if (null != schema.get$ref()) {
			Map<String, Schema> allDefinitions = ModelUtils.getSchemas(this.openAPI);
			String ref = ModelUtils.getSimpleRef(schema.get$ref());
			Schema refSchema = allDefinitions.get(ref);
			if (null == refSchema) {
				LOGGER.warn("Unable to find referenced schema " + schema.get$ref() + "\n");
				return fullPrefix + "null" + closeChars;
			}
			String refModelName = getModelName(schema);
			return toExampleValueRecursive(refModelName, refSchema, objExample, indentationLevel, prefix, exampleLine, seenSchemas);
		} else if (ModelUtils.isNullType(schema) || ModelUtils.isAnyType(schema)) {
			// The 'null' type is allowed in OAS 3.1 and above. It is not supported by OAS 3.0.x,
			// though this tooling supports it.
			return fullPrefix + "null" + closeChars;
		} else if (ModelUtils.isBooleanSchema(schema)) {
			if (objExample == null) {
				example = "true";
			} else {
				if ("false".equalsIgnoreCase(objExample.toString())) {
					example = "false";
				} else {
					example = "true";
				}
			}
			return fullPrefix + example + closeChars;
		} else if (ModelUtils.isDateSchema(schema)) {
			if (objExample == null) {
				example = typescriptDate("1970-01-01");
			} else {
				example = typescriptDate(objExample);
			}
			return fullPrefix + example + closeChars;
		} else if (ModelUtils.isDateTimeSchema(schema)) {
			if (objExample == null) {
				example = typescriptDateTime("1970-01-01T00:00:00.00Z");
			} else {
				example = typescriptDateTime(objExample);
			}
			return fullPrefix + example + closeChars;
		} else if (ModelUtils.isBinarySchema(schema)) {
			if (objExample == null) {
				example = "/path/to/file";
			}
			example = "{ data: Buffer.from(fs.readFileSync('" + example + "', 'utf-8')), name: '" + example + "' }";
			return fullPrefix + example + closeChars;
		} else if (ModelUtils.isByteArraySchema(schema)) {
			if (objExample == null) {
				example = "'YQ=='";
			}
			return fullPrefix + example + closeChars;
		} else if (ModelUtils.isStringSchema(schema)) {
			if (objExample == null) {
				// a BigDecimal:
				if ("Number".equalsIgnoreCase(schema.getFormat())) {
					example = "2";
					return fullPrefix + example + closeChars;
				} else if (StringUtils.isNotBlank(schema.getPattern())) {
					String pattern = schema.getPattern();
					RgxGen rgxGen = new RgxGen(pattern);

					// this seed makes it so if we have [a-z] we pick a
					Random random = new Random(18);
					example = rgxGen.generate(random);
				} else if (schema.getMinLength() != null) {
					example = "";
					int len = schema.getMinLength().intValue();
					for (int i = 0; i < len; i++) example += "a";
				} else if (ModelUtils.isUUIDSchema(schema)) {
					example = "046b6c7f-0b8a-43b9-b35d-6489e6daee91";
				} else {
					example = "string_example";
				}
			}
			return fullPrefix + ensureQuotes(example) + closeChars;
		} else if (ModelUtils.isIntegerSchema(schema)) {
			if (objExample == null) {
				if (schema.getMinimum() != null) {
					example = schema.getMinimum().toString();
				} else {
					example = "1";
				}
			}
			return fullPrefix + example + closeChars;
		} else if (ModelUtils.isNumberSchema(schema)) {
			if (objExample == null) {
				if (schema.getMinimum() != null) {
					example = schema.getMinimum().toString();
				} else {
					example = "3.14";
				}
			}
			return fullPrefix + example + closeChars;
		} else if (ModelUtils.isArraySchema(schema)) {
			ArraySchema arrayschema = (ArraySchema) schema;
			Schema itemSchema = arrayschema.getItems();
			String itemModelName = getModelName(itemSchema);
			if (objExample instanceof Iterable && itemModelName == null) {
				// If the example is already a list, return it directly instead of wrongly wrap it in another list
				return fullPrefix + objExample + closeChars;
			}
			Set<Schema> newSeenSchemas = new HashSet<>(seenSchemas);
			newSeenSchemas.add(schema);
			example = fullPrefix + "[" + "\n" + toExampleValueRecursive(itemModelName, itemSchema, objExample, indentationLevel + 1, "", exampleLine + 1, newSeenSchemas) + ",\n" + closingIndentation + "]" + closeChars;
			return example;
		} else if (ModelUtils.isMapSchema(schema)) {
			if (modelName == null) {
				fullPrefix += "{";
				closeChars = "}";
			}
			Object addPropsObj = schema.getAdditionalProperties();
			// TODO handle true case for additionalProperties
			if (addPropsObj instanceof Schema) {
				Schema addPropsSchema = (Schema) addPropsObj;
				String key = "key";
				Object addPropsExample = getObjectExample(addPropsSchema);
				if (addPropsSchema.getEnum() != null && !addPropsSchema.getEnum().isEmpty()) {
					key = addPropsSchema.getEnum().get(0).toString();
				}
				addPropsExample = exampleFromStringOrArraySchema(addPropsSchema, addPropsExample, key);
				String addPropPrefix = key + ": ";
				if (modelName == null) {
					addPropPrefix = ensureQuotes(key) + ": ";
				}
				String addPropsModelName = "\"" + getModelName(addPropsSchema) + "\"";
				Set<Schema> newSeenSchemas = new HashSet<>(seenSchemas);
				newSeenSchemas.add(schema);
				example = fullPrefix + "\n" + toExampleValueRecursive(addPropsModelName, addPropsSchema, addPropsExample, indentationLevel + 1, addPropPrefix, exampleLine + 1, newSeenSchemas) + ",\n" + closingIndentation + closeChars;
			} else {
				example = fullPrefix + closeChars;
			}
			return example;
		} else if (ModelUtils.isComposedSchema(schema)) {
			ComposedSchema cm = (ComposedSchema) schema;
			List<Schema> ls = cm.getOneOf();
			if (ls != null && !ls.isEmpty()) {
				return fullPrefix + toExampleValue(ls.get(0)) + closeChars;
			}
			return fullPrefix + closeChars;
		} else if (ModelUtils.isObjectSchema(schema)) {
			fullPrefix += "{";
			closeChars = "}";
			CodegenDiscriminator disc = createDiscriminator(modelName, schema, openAPI);
			if (disc != null) {
				CodegenDiscriminator.MappedModel mm = getDiscriminatorMappedModel(disc);
				if (mm != null) {
					String discPropNameValue = mm.getMappingName();
					String chosenModelName = mm.getModelName();
					// TODO handle this case in the future, this is when the discriminated
					// schema allOf includes this schema, like Cat allOf includes Pet
					// so this is the composed schema use case
				} else {
					return fullPrefix + closeChars;
				}
			}

			Set<Schema> newSeenSchemas = new HashSet<>(seenSchemas);
			newSeenSchemas.add(schema);
			String exampleForObjectModel = exampleForObjectModel(schema, fullPrefix, closeChars, null, indentationLevel, exampleLine, closingIndentation, newSeenSchemas);
			return exampleForObjectModel;
		} else {
			LOGGER.warn("Type " + schema.getType() + " not handled properly in toExampleValue");
		}

		return example;
	}

	private String exampleForObjectModel(Schema schema, String fullPrefix, String closeChars, CodegenProperty discProp, int indentationLevel, int exampleLine, String closingIndentation, Set<Schema> seenSchemas) {
		Map<String, Schema> requiredAndOptionalProps = schema.getProperties();
		if (requiredAndOptionalProps == null || requiredAndOptionalProps.isEmpty()) {
			return fullPrefix + closeChars;
		}

		String example = fullPrefix + "\n";
		for (Map.Entry<String, Schema> entry : requiredAndOptionalProps.entrySet()) {
			String propName = entry.getKey();
			Schema propSchema = entry.getValue();
			boolean readOnly = false;
			if (propSchema.getReadOnly() != null) {
				readOnly = propSchema.getReadOnly();
			}
			if (readOnly) {
				continue;
			}
			String ref = propSchema.get$ref();
			if (ref != null) {
				Schema refSchema = ModelUtils.getSchema(this.openAPI, ModelUtils.getSimpleRef(ref));
				if (refSchema.getReadOnly() != null) {
					readOnly = refSchema.getReadOnly();
				}
				if (readOnly) {
					continue;
				}
			}
			propName = toVarName(propName);
			String propModelName = null;
			Object propExample = null;
			if (discProp != null && propName.equals(discProp.name)) {
				propModelName = null;
				propExample = discProp.example;
			} else {
				propModelName = getModelName(propSchema);
				propExample = exampleFromStringOrArraySchema(propSchema, null, propName);
			}
			example += toExampleValueRecursive(propModelName, propSchema, propExample, indentationLevel + 1, propName + ": ", exampleLine + 1, seenSchemas) + ",\n";
		}
		// TODO handle additionalProperties also
		example += closingIndentation + closeChars;
		return example;
	}

	private Object exampleFromStringOrArraySchema(Schema sc, Object currentExample, String propName) {
		if (currentExample != null) {
			return currentExample;
		}
		Schema schema = sc;
		String ref = sc.get$ref();
		if (ref != null) {
			schema = ModelUtils.getSchema(this.openAPI, ModelUtils.getSimpleRef(ref));
		}
		Object example = getObjectExample(schema);
		if (example != null) {
			return example;
		} else if (simpleStringSchema(schema)) {
			return propName + "_example";
		} else if (ModelUtils.isArraySchema(schema)) {
			ArraySchema arraySchema = (ArraySchema) schema;
			Schema itemSchema = arraySchema.getItems();
			example = getObjectExample(itemSchema);
			if (example != null) {
				return example;
			} else if (simpleStringSchema(itemSchema)) {
				return propName + "_example";
			}
		}
		return null;
	}

	/***
	 * Set the codegenParameter example value
	 * We have a custom version of this function so we can invoke toExampleValue
	 *
	 * @param codegenParameter the item we are setting the example on
	 * @param parameter the base parameter that came from the spec
	 */
	@Override
	public void setParameterExampleValue(CodegenParameter codegenParameter, Parameter parameter) {
		Schema schema = parameter.getSchema();
		if (schema == null) {
			LOGGER.warn("CodegenParameter.example defaulting to null because parameter lacks a schema");
			return;
		}

		Object example = null;
		if (codegenParameter.vendorExtensions != null && codegenParameter.vendorExtensions.containsKey("x-example")) {
			example = codegenParameter.vendorExtensions.get("x-example");
		} else if (parameter.getExample() != null) {
			example = parameter.getExample();
		} else if (parameter.getExamples() != null && !parameter.getExamples().isEmpty() && parameter.getExamples().values().iterator().next().getValue() != null) {
			example = parameter.getExamples().values().iterator().next().getValue();
		} else {
			example = getObjectExample(schema);
		}
		example = exampleFromStringOrArraySchema(schema, example, parameter.getName());
		String finalExample = toExampleValue(schema, example);
		codegenParameter.example = finalExample;
	}

	/**
	 * Return the example value of the parameter.
	 *
	 * @param codegenParameter Codegen parameter
	 * @param requestBody      Request body
	 */
	@Override
	public void setParameterExampleValue(CodegenParameter codegenParameter, RequestBody requestBody) {
		if (codegenParameter.vendorExtensions != null && codegenParameter.vendorExtensions.containsKey("x-example")) {
			codegenParameter.example = Json.pretty(codegenParameter.vendorExtensions.get("x-example"));
		}

		Content content = requestBody.getContent();

		if (content.size() > 1) {
			// @see ModelUtils.getSchemaFromContent()
			once(LOGGER).warn("Multiple MediaTypes found, using only the first one");
		}

		MediaType mediaType = content.values().iterator().next();
		Schema schema = mediaType.getSchema();
		if (schema == null) {
			LOGGER.warn("CodegenParameter.example defaulting to null because requestBody content lacks a schema");
			return;
		}

		Object example = null;
		if (mediaType.getExample() != null) {
			example = mediaType.getExample();
		} else if (mediaType.getExamples() != null && !mediaType.getExamples().isEmpty() && mediaType.getExamples().values().iterator().next().getValue() != null) {
			example = mediaType.getExamples().values().iterator().next().getValue();
		} else {
			example = getObjectExample(schema);
		}
		example = exampleFromStringOrArraySchema(schema, example, codegenParameter.paramName);
		codegenParameter.example = toExampleValue(schema, example);
	}

	/**
	 * Create a CodegenParameter for a Form Property
	 * We have a custom version of this method so we can invoke
	 * setParameterExampleValue(codegenParameter, parameter)
	 * rather than setParameterExampleValue(codegenParameter)
	 * This ensures that all of our samples are generated in
	 * toExampleValueRecursive
	 *
	 * @param name           the property name
	 * @param propertySchema the property schema
	 * @param imports        our import set
	 * @return the resultant CodegenParameter
	 */
	@Override
	public CodegenParameter fromFormProperty(String name, Schema propertySchema, Set<String> imports) {
		CodegenParameter cp = super.fromFormProperty(name, propertySchema, imports);
		Parameter p = new Parameter();
		p.setSchema(propertySchema);
		p.setName(cp.paramName);
		setParameterExampleValue(cp, p);
		return cp;
	}

	@Override
	public String toAnyOfName(List<String> names, ComposedSchema composedSchema) {
		List<String> types = getTypesFromSchemas(composedSchema.getAnyOf());

		return String.join(" | ", types);
	}

	@Override
	public String toOneOfName(List<String> names, ComposedSchema composedSchema) {
		List<String> types = getTypesFromSchemas(composedSchema.getOneOf());

		return String.join(" | ", types);
	}

	@Override
	public String toAllOfName(List<String> names, ComposedSchema composedSchema) {
		List<String> types = getTypesFromSchemas(composedSchema.getAllOf());

		return String.join(" & ", types);
	}

	/**
	 * Extracts the list of type names from a list of schemas.
	 * Excludes `AnyType` if there are other valid types extracted.
	 *
	 * @param schemas list of schemas
	 * @return list of types
	 */
    protected List<String> getTypesFromSchemas(List<Schema> schemas) {
        List<String> types = new ArrayList<>();
        boolean hasNull = false;

        for (Schema schema : schemas) {
            // Check if this is a null type using types property (OpenAPI 3.1)
            if (schema.getTypes() != null && schema.getTypes().contains("null")) {
                hasNull = true;
                // If there are other types besides null, process them
                if (schema.getTypes().size() == 1) {
                    continue;
                }
            }

            // Check if this is a null type
            if (ModelUtils.isNullType(schema) ||
                    (schema.getType() != null && "null".equals(schema.getType()))) {
                hasNull = true;
                continue;
            }

            String schemaType = null;

            // Try to get type from types property (OpenAPI 3.1)
            if (schema.getTypes() != null && !schema.getTypes().isEmpty()) {
                for (Object tObj : schema.getTypes()) {
                    String t = tObj.toString();
                    if (!"null".equals(t)) {
                        if ("string".equals(t)) {
                            schemaType = "string";
                        } else if ("integer".equals(t)) {
                            schemaType = "number";
                        } else if ("number".equals(t)) {
                            schemaType = "number";
                        } else if ("boolean".equals(t)) {
                            schemaType = "boolean";
                        } else if ("array".equals(t)) {
                            // Handle OpenAPI 3.1 array with JsonSchema
                            Schema items = null;
                            if (ModelUtils.isArraySchema(schema)) {
                                ArraySchema ap = (ArraySchema) schema;
                                items = ap.getItems();
                            } else if (schema instanceof io.swagger.v3.oas.models.media.JsonSchema) {
                                io.swagger.v3.oas.models.media.JsonSchema jsonSchema = (io.swagger.v3.oas.models.media.JsonSchema) schema;
                                items = jsonSchema.getItems();
                            }
                            if (items != null) {
                                schemaType = "Array<" + getSchemaType(items) + ">";
                            } else {
                                schemaType = "Array<any>";
                            }
                        }
                        if (schemaType != null) {
                            break;
                        }
                    }
                }
            }

            // Fallback to original logic if not found via types property
            if (schemaType == null) {
                // Handle primitive types directly to avoid getting "AnyType"
                if (ModelUtils.isStringSchema(schema)) {
                    schemaType = "string";
                } else if (ModelUtils.isIntegerSchema(schema)) {
                    schemaType = "number";
                } else if (ModelUtils.isNumberSchema(schema)) {
                    schemaType = "number";
                } else if (ModelUtils.isBooleanSchema(schema)) {
                    schemaType = "boolean";
                } else if (ModelUtils.isArraySchema(schema)) {
                    ArraySchema ap = (ArraySchema) schema;
                    Schema inner = ap.getItems();
                    schemaType = "Array<" + getSchemaType(inner) + ">";
                } else if (schema instanceof io.swagger.v3.oas.models.media.JsonSchema &&
                          schema.getTypes() != null && schema.getTypes().contains("array")) {
                    // Handle OpenAPI 3.1 JsonSchema array
                    io.swagger.v3.oas.models.media.JsonSchema jsonSchema = (io.swagger.v3.oas.models.media.JsonSchema) schema;
                    Schema items = jsonSchema.getItems();
                    if (items != null) {
                        schemaType = "Array<" + getSchemaType(items) + ">";
                    } else {
                        schemaType = "Array<any>";
                    }
                } else {
                    // For complex types, use getSchemaType
                    schemaType = getSchemaType(schema);

                    // Skip AnyType if we have other types
                    String superSchemaType = super.getSchemaType(schema);
                    if ("AnyType".equals(superSchemaType) && schemas.size() > 1) {
                        continue;
                    }
                }
            }

            if (schemaType != null) {
                types.add(schemaType);
            }
        }

        // Add null at the end if present
        if (hasNull) {
            types.add("null");
        }

        return types.stream().distinct().collect(Collectors.toList());
    }

	@Override
	protected void addImport(CodegenModel m, String type) {
		if (type == null) {
			return;
		}

		// Skip types that start with "Array<" - these are generic array types
		if (type.startsWith("Array<")) {
			// Extract the inner type from Array<Type>
			String innerType = type.substring(6, type.length() - 1);
			// Recursively add the inner type
			addImport(m, innerType);
			return;
		}

		String[] parts = splitComposedType(type);
		for (String s : parts) {
			// Don't import TypeScript built-in types and primitives
			if (!"null".equals(s) && !"Array".equals(s) && needToImport(s)) {
				m.imports.add(s);
			}
		}
	}

	@Override
	protected void addImport(Set<String> importsToBeAddedTo, String type) {
		if (type == null) {
			return;
		}

		// Skip types that start with "Array<" - these are generic array types
		if (type.startsWith("Array<")) {
			// Extract the inner type from Array<Type>
			String innerType = type.substring(6, type.length() - 1);
			// Recursively add the inner type
			addImport(importsToBeAddedTo, innerType);
			return;
		}

		String[] parts = splitComposedType(type);
		for (String s : parts) {
			// Don't import TypeScript built-in types and primitives
			if (!"null".equals(s) && !"Array".equals(s)) {
				super.addImport(importsToBeAddedTo, s);
			}
		}
	}

	/**
	 * Split composed types
	 * e.g. TheFirstType | TheSecondType to TheFirstType and TheSecondType
	 *
	 * @param type String with composed types
	 * @return list of types
	 */
	protected String[] splitComposedType(String type) {
		return type.replace(" ","").split("[|&<>]");
	}

	@Override
	public GeneratorLanguage generatorLanguage() {
		return GeneratorLanguage.TYPESCRIPT;
	}
}
