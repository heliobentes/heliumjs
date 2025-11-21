import http from 'http';
import type WebSocket from 'ws';
import { WebSocketServer } from 'ws';

import { HTTPRouter } from './httpRouter.js';
import { RpcRegistry } from './rpcRegistry.js';

type LoadHandlersFn = (registry: RpcRegistry, httpRouter: HTTPRouter) => void;

let currentRegistry: RpcRegistry | null = null;
let currentHttpRouter: HTTPRouter | null = null;
let devServerStarted = false;

export function startDevServer(loadHandlers: LoadHandlersFn) {
    const registry = new RpcRegistry();
    const httpRouter = new HTTPRouter();
    loadHandlers(registry, httpRouter);
    currentRegistry = registry;
    currentHttpRouter = httpRouter;

    if (devServerStarted) {
        // Server already running, just updated the registries
        return;
    }

    devServerStarted = true;
    const port = Number(process.env.HELIUM_RPC_PORT || 4001);

    const server = http.createServer(async (req, res) => {
        if (req.url === '/health') {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('ok');
            return;
        }

        // Try HTTP handlers first
        if (currentHttpRouter) {
            const handled = await currentHttpRouter.handleRequest(req, res);
            if (handled) return;
        }

        res.writeHead(404);
        res.end('Not found');
    });

    const wss = new WebSocketServer({ server, path: '/ws' });

    wss.on('connection', (socket: WebSocket) => {
        socket.on('message', (msg: WebSocket.RawData) => {
            // Always use the current registry (may have been updated)
            if (currentRegistry) {
                currentRegistry.handleMessage(socket, msg.toString());
            }
        });
    });

    server.listen(port, () => {
        console.log(`[Helium] ➜ dev RPC server listening on http://localhost:${port}`);
    });
}
