import type { HeliumContext } from "./context.js";

export interface MiddlewareNext {
    (): Promise<void>;
}

export interface MiddlewareContext {
    ctx: HeliumContext;
    type: "method" | "http";
    methodName?: string;
    httpMethod?: string;
    httpPath?: string;
}

export type MiddlewareFunction = (context: MiddlewareContext, next: MiddlewareNext) => Promise<void> | void;

export interface HeliumMiddleware {
    __kind: "middleware";
    handler: MiddlewareFunction;
}

export function middleware(handler: MiddlewareFunction): HeliumMiddleware {
    if (!handler) {
        throw new Error("middleware requires a handler");
    }

    return {
        __kind: "middleware",
        handler,
    };
}

// Alias for backwards compatibility
export const defineMiddleware = middleware;
