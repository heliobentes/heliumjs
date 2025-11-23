import { decode as msgpackDecode, encode as msgpackEncode } from "@msgpack/msgpack";

import type { RpcRequest, RpcResponse, RpcStats } from "../runtime/protocol.js";

export type RpcResult<T> = {
    data: T;
    stats: RpcStats;
};

declare global {
    interface Window {
        HELIUM_CONNECTION_TOKEN?: string;
        /** Advertisement from server - preferred RPC encoding, "json" or "msgpack" */
        HELIUM_RPC_ENCODING?: "json" | "msgpack";
    }
}

let socket: WebSocket | null = null;
let connectionPromise: Promise<WebSocket> | null = null;

const pending = new Map<string, { resolve: (v: unknown) => void; reject: (e: unknown) => void }>();

function uuid() {
    return Math.random().toString(36).slice(2);
}

function createSocket(): WebSocket {
    // Use the same protocol, hostname and port as the current page
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host; // includes hostname and port
    const token = window.HELIUM_CONNECTION_TOKEN;
    const url = `${protocol}//${host}/rpc${token ? `?token=${token}` : ""}`;
    const ws = new WebSocket(url);
    ws.binaryType = "arraybuffer";

    // Determine client-side encoding preference from server-injected global (falls back to msgpack)
    const clientEncoding: "json" | "msgpack" = (window.HELIUM_RPC_ENCODING as any) || "msgpack";

    ws.onmessage = (event) => {
        let msg: RpcResponse;

        // Handle both binary (MessagePack) and text (JSON) messages.
        // Accept either format so server & client can be configured independently while remaining compatible.
        if (event.data instanceof ArrayBuffer) {
            msg = msgpackDecode(new Uint8Array(event.data)) as RpcResponse;
        } else {
            // If the server advertises JSON we parse JSON, otherwise attempt JSON parse and fall back to msgpack decode
            if (clientEncoding === "json") {
                msg = JSON.parse(event.data);
            } else {
                // Try JSON first (string) — if it isn't JSON, decode as msgpack binary
                try {
                    msg = JSON.parse(event.data);
                } catch {
                    // Sometimes servers send binary even if configured; handle it defensively
                    msg = msgpackDecode(new Uint8Array(event.data)) as RpcResponse;
                }
            }
        }

        const entry = pending.get(msg.id);
        if (!entry) {
            return;
        }
        pending.delete(msg.id);
        if (msg.ok) {
            entry.resolve({ data: msg.result, stats: msg.stats });
        } else {
            entry.reject({ error: msg.error, stats: msg.stats });
        }
    };

    ws.onclose = () => {
        if (socket === ws) {
            socket = null;
            connectionPromise = null;
        }
    };

    return ws;
}

function ensureSocketReady(): Promise<WebSocket> {
    // If we have an open socket, return it immediately
    if (socket && socket.readyState === WebSocket.OPEN) {
        return Promise.resolve(socket);
    }

    // If we have a connection in progress, reuse that promise
    if (connectionPromise) {
        return connectionPromise;
    }

    // If we have a socket that's connecting, wait for it
    if (socket && socket.readyState === WebSocket.CONNECTING) {
        connectionPromise = new Promise((resolve, reject) => {
            const cleanup = () => {
                socket!.removeEventListener("open", handleOpen);
                socket!.removeEventListener("error", handleError);
                socket!.removeEventListener("close", handleClose);
            };
            const handleOpen = () => {
                cleanup();
                connectionPromise = null;
                resolve(socket!);
            };
            const handleError = () => {
                cleanup();
                socket = null;
                connectionPromise = null;
                reject(new Error("WebSocket connection failed"));
            };
            const handleClose = () => {
                cleanup();
                socket = null;
                connectionPromise = null;
                reject(new Error("WebSocket closed before opening"));
            };

            socket!.addEventListener("open", handleOpen);
            socket!.addEventListener("error", handleError);
            socket!.addEventListener("close", handleClose);
        });
        return connectionPromise;
    }

    // Create a new socket and connection promise
    socket = createSocket();
    connectionPromise = new Promise((resolve, reject) => {
        const cleanup = () => {
            socket!.removeEventListener("open", handleOpen);
            socket!.removeEventListener("error", handleError);
            socket!.removeEventListener("close", handleClose);
        };
        const handleOpen = () => {
            cleanup();
            connectionPromise = null;
            resolve(socket!);
        };
        const handleError = () => {
            cleanup();
            socket = null;
            connectionPromise = null;
            reject(new Error("WebSocket connection failed"));
        };
        const handleClose = () => {
            cleanup();
            socket = null;
            connectionPromise = null;
            reject(new Error("WebSocket closed before opening"));
        };

        socket!.addEventListener("open", handleOpen);
        socket!.addEventListener("error", handleError);
        socket!.addEventListener("close", handleClose);
    });

    return connectionPromise;
}

export async function rpcCall<TResult = unknown, TArgs = unknown>(methodId: string, args?: TArgs): Promise<RpcResult<TResult>> {
    const ws = await ensureSocketReady();
    const id = uuid();

    const req: RpcRequest = { id, method: methodId, args };

    return new Promise<RpcResult<TResult>>((resolve, reject) => {
        // Store generic handlers that take unknown; the wrapper will cast to RpcResult<TResult>
        pending.set(id, {
            resolve: (v: unknown) => resolve(v as RpcResult<TResult>),
            reject,
        });
        try {
            // Encode according to preferred transport encoding
            const clientEncoding: "json" | "msgpack" = (window.HELIUM_RPC_ENCODING as any) || "msgpack";
            if (clientEncoding === "msgpack") {
                const encoded = msgpackEncode(req);
                ws.send(encoded);
            } else {
                ws.send(JSON.stringify(req));
            }
        } catch (err) {
            pending.delete(id);
            reject(err);
        }
    });
}
