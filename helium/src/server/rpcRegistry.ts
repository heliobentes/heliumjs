import WebSocket from "ws";

import type { RpcRequest, RpcResponse } from "../runtime/protocol.js";
import type { HeliumMethodDef } from "./defineMethod.js";
import type { HeliumMiddleware } from "./middleware.js";

export class RpcRegistry {
    private methods = new Map<string, HeliumMethodDef<any, any>>();
    private middleware: HeliumMiddleware | null = null;

    register(id: string, def: HeliumMethodDef<any, any>) {
        def.__id = id;
        this.methods.set(id, def);
    }

    setMiddleware(middleware: HeliumMiddleware) {
        this.middleware = middleware;
    }

    async handleMessage(socket: WebSocket, raw: string) {
        let req: RpcRequest;
        try {
            req = JSON.parse(raw);
        } catch {
            return;
        }

        const def = this.methods.get(req.method);
        if (!def) {
            const res: RpcResponse = {
                id: req.id,
                ok: false,
                error: { message: `Unknown method ${req.method}` },
            };
            socket.send(JSON.stringify(res));
            return;
        }

        try {
            const ctx = {}; // TODO: add real context
            let result: any;

            // Execute middleware if present
            if (this.middleware) {
                let nextCalled = false;
                await this.middleware.handler(
                    {
                        ctx,
                        type: "method",
                        methodName: req.method,
                    },
                    async () => {
                        nextCalled = true;
                        result = await def.handler(req.args, ctx);
                    }
                );

                // If next() was not called, the middleware blocked the request
                if (!nextCalled) {
                    const res: RpcResponse = {
                        id: req.id,
                        ok: false,
                        error: { message: "Request blocked by middleware" },
                    };
                    socket.send(JSON.stringify(res));
                    return;
                }
            } else {
                // No middleware, execute handler directly
                result = await def.handler(req.args, ctx);
            }

            const res: RpcResponse = {
                id: req.id,
                ok: true,
                result,
            };
            socket.send(JSON.stringify(res));
        } catch (err: any) {
            const res: RpcResponse = {
                id: req.id,
                ok: false,
                error: { message: err?.message ?? "Server error" },
            };
            socket.send(JSON.stringify(res));
        }
    }
}
