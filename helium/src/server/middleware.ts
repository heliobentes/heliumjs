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

/**
 * Create a Helium middleware wrapper from a function.
 *
 * Middleware receives a `MiddlewareContext` and a `next` callback. Use it
 * to implement cross-cutting concerns such as auth, logging or request guards.
 * Returning without calling `next()` prevents the underlying handler from
 * executing (useful for access control).
 *
 * @param handler - middleware function with signature (context, next)
 * @returns a HeliumMiddleware object suitable for registration
 */
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
