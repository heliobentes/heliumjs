import fs from "fs";
import path from "path";

import { SERVER_DIR } from "./paths.js";

export interface MethodExport {
    name: string;
    filePath: string;
}

export interface HTTPHandlerExport {
    name: string;
    filePath: string;
}

export interface MiddlewareExport {
    name: string;
    filePath: string;
}

export interface ServerExports {
    methods: MethodExport[];
    httpHandlers: HTTPHandlerExport[];
    middleware?: MiddlewareExport;
}

export function scanServerMethods(root: string): MethodExport[] {
    const exports = scanServerExports(root);
    return exports.methods;
}

export function scanServerExports(root: string): ServerExports {
    const serverDir = path.resolve(root, SERVER_DIR);
    if (!fs.existsSync(serverDir)) {
        return { methods: [], httpHandlers: [] };
    }

    const methods: MethodExport[] = [];
    const httpHandlers: HTTPHandlerExport[] = [];
    let middleware: MiddlewareExport | undefined;

    function walk(dir: string) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                walk(fullPath);
            } else if (file.endsWith(".ts")) {
                const content = fs.readFileSync(fullPath, "utf-8");

                // Check for _middleware.ts file
                if (file === "_middleware.ts") {
                    // Support both 'middleware' and 'defineMiddleware' (backwards compatibility)
                    const middlewareRegex = /export\s+(const|default)\s+(\w+)\s*=\s*(middleware|defineMiddleware)/;
                    const match = middlewareRegex.exec(content);
                    if (match) {
                        middleware = {
                            name: match[2],
                            filePath: fullPath,
                        };
                    }
                    // Also support default export
                    const defaultRegex = /export\s+default\s+(middleware|defineMiddleware)/;
                    if (defaultRegex.test(content)) {
                        middleware = {
                            name: "default",
                            filePath: fullPath,
                        };
                    }
                }

                // Find: export const methodName = defineMethod(...)
                const methodRegex = /export\s+const\s+(\w+)\s*=\s*defineMethod/g;
                let match;
                while ((match = methodRegex.exec(content)) !== null) {
                    methods.push({
                        name: match[1],
                        filePath: fullPath,
                    });
                }

                // Find: export const handlerName = defineHTTPRequest(...)
                const httpRegex = /export\s+const\s+(\w+)\s*=\s*defineHTTPRequest/g;
                while ((match = httpRegex.exec(content)) !== null) {
                    httpHandlers.push({
                        name: match[1],
                        filePath: fullPath,
                    });
                }
            }
        }
    }

    walk(serverDir);
    return { methods, httpHandlers, middleware };
}
