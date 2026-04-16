package com.ngx.generator;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.Operation;
import java.util.*;

public class ServiceParser {
    private final ModelParser modelParser;

    public ServiceParser(ModelParser modelParser) {
        this.modelParser = modelParser;
    }

    public record ServiceGroup(String name, List<ServiceOp> operations, Set<String> imports) {}

    public record ServiceOp(
            String nickname, String path, String method, String returnType,
            String deserializerType, List<ServiceParam> allParams,
            List<ServiceParam> pathParams, ServiceParam bodyParam,
            String bodyType, boolean isVoid, String summary
    ) {}

    public record ServiceParam(String name, String baseName, String dataType, boolean required) {}

    public List<ServiceGroup> parse(OpenAPI openApi) {
        Map<String, List<ServiceOp>> groups = new HashMap<>();
        Map<String, Set<String>> groupImports = new HashMap<>();

        openApi.getPaths().forEach((path, item) -> {
            item.readOperationsMap().forEach((method, op) -> {
                // Group by Tag (e.g., DashboardService)
                String serviceName = (op.getTags() != null && !op.getTags().isEmpty())
                        ? op.getTags().get(0) : "ApiService";

                groups.computeIfAbsent(serviceName, k -> new ArrayList<>());
                groupImports.computeIfAbsent(serviceName, k -> new TreeSet<>());

                groups.get(serviceName).add(parseOp(op, path, method.name(), groupImports.get(serviceName)));
            });
        });

        return groups.entrySet().stream()
                .map(e -> new ServiceGroup(e.getKey(), e.getValue(), groupImports.get(e.getKey())))
                .toList();
    }

    private ServiceOp parseOp(Operation op, String path, String method, Set<String> imports) {
        List<ServiceParam> all = new ArrayList<>();
        List<ServiceParam> paths = new ArrayList<>();
        ServiceParam body = null;
        String bodyType = "";

        // Parameters
        if (op.getParameters() != null) {
            for (var p : op.getParameters()) {
                var type = modelParser.generateTypeScriptType(modelParser.resolve(p.getSchema(), imports), false);
                var param = new ServiceParam(p.getName(), p.getName(), type, Boolean.TRUE.equals(p.getRequired()));
                all.add(param);
                if ("path".equals(p.getIn())) paths.add(param);
            }
        }

        // Body
        if (op.getRequestBody() != null && op.getRequestBody().getContent().containsKey("application/json")) {
            var schema = op.getRequestBody().getContent().get("application/json").getSchema();
            bodyType = extractRefName(schema.get$ref());
            var type = modelParser.generateTypeScriptType(modelParser.resolve(schema, imports), false);
            body = new ServiceParam(bodyType.toLowerCase(), "body", type, true);
            all.add(body);
        }

        // Return Types logic
        String tsReturnType = "void";
        String dsTypeString = "void";
        var res200 = op.getResponses().get("200");

        if (res200 != null && res200.getContent() != null && res200.getContent().get("application/json") != null) {
            var schema = res200.getContent().get("application/json").getSchema();
            tsReturnType = modelParser.generateTypeScriptType(modelParser.resolve(schema, imports), false);

            // Transform T[] into Array<T> for the string argument
            dsTypeString = tsReturnType.endsWith("[]")
                    ? "Array<" + tsReturnType.substring(0, tsReturnType.length() - 2) + ">"
                    : tsReturnType;
        }

        return new ServiceOp(
                op.getOperationId(), path, method.toLowerCase(), tsReturnType, dsTypeString,
                all, paths, body, bodyType, "void".equals(tsReturnType), op.getSummary()
        );
    }

    private String extractRefName(String ref) {
        return (ref != null && ref.contains("/")) ? ref.substring(ref.lastIndexOf('/') + 1) : "any";
    }
}