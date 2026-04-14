# OpenAPI Generator for ts artifacts


## Building and using locally

You can run this:

```
mvn package
```

In your generator project. A single jar file will be produced in `target`. You can now use that with [OpenAPI Generator](https://openapi-generator.tech):

When using the `openapi-generator-cli` npm wrapper:
```
openapi-generator-cli --custom-generator /path/to/openapi-generator-cli.jar generate -g ts-generator -i /path/to/openapi.yaml -o ./test
```

For mac/linux:
```
java -cp /path/to/openapi-generator-cli.jar:/path/to/your.jar org.openapitools.codegen.OpenAPIGenerator generate -g ts-generator -i /path/to/openapi.yaml -o ./test
```
(Do not forget to replace the values `/path/to/openapi-generator-cli.jar`, `/path/to/your.jar` and `/path/to/openapi.yaml` in the previous command)

For Windows users, you will need to use `;` instead of `:` in the classpath, e.g.
```
java -cp /path/to/openapi-generator-cli.jar;/path/to/your.jar org.openapitools.codegen.OpenAPIGenerator generate -g ts-generator -i /path/to/openapi.yaml -o ./test
```

Now your templates are available to the client generator and you can write output values

## Debug / List Template Variables

For the templates themselves, you have a number of values available to you for generation.
You can execute the `java` command from above while passing different debug flags to show
the object you have available during client generation:

```
# The following additional debug options are available for all codegen targets:
# -DdebugOpenAPI prints the OpenAPI Specification as interpreted by the codegen
# -DdebugModels prints models passed to the template engine
# -DdebugOperations prints operations passed to the template engine
# -DdebugSupportingFiles prints additional data passed to the template engine

java -DdebugOperations -cp /path/to/openapi-generator-cli.jar:/path/to/your.jar org.openapitools.codegen.OpenAPIGenerator generate -g ts-generator -i /path/to/openapi.yaml -o ./test
```

Will, for example, output the debug info for operations.
You can use this info in the `api.mustache` file.