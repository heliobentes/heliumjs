import type { HeliumContext } from "./context.js";

export type HeliumMethodDef<TArgs = any, TResult = any> = {
    __kind: "method";
    __id: string;
    handler: (args: TArgs, ctx: HeliumContext) => Promise<TResult> | TResult;
};

/**
 * Create a Helium server method definition from a handler function.
 *
 * Methods defined with `defineMethod` are discovered by the build/dev tooling
 * and exposed to clients as callable stubs. The returned object contains the
 * `handler` and an `__id` that is used to identify the method at runtime.
 *
 * @typeParam TArgs - the expected arguments type for the handler
 * @typeParam TResult - the handler's return type
 * @param handler - function that receives (args, ctx) and returns a result or Promise
 * @returns a HeliumMethodDef that can be registered by the server runtime
 */
export function defineMethod<TArgs, TResult>(handler: (args: TArgs, ctx: HeliumContext) => Promise<TResult> | TResult): HeliumMethodDef<TArgs, TResult> {
    if (!handler) {
        throw new Error("defineMethod requires a handler");
    }

    return {
        __kind: "method",
        __id: handler.name || "",
        handler,
    };
}
