import { middleware } from "helium/server";

import { connectToDatabase } from "./db/connection";

/**
 * Example middleware that runs on every method call and HTTP request.
 *
 * This middleware:
 * - Logs all incoming requests
 * - Can add custom data to the context
 * - Can block requests by not calling next()
 */
export default middleware(async (context, next) => {
    const startTime = performance.now();
    await connectToDatabase();
    const dbConnectTime = performance.now();

    const timestamp = new Date().toISOString();

    if (context.type === "method") {
        console.log(`[${timestamp}] RPC Method: ${context.methodName}`);
    } else if (context.type === "http") {
        console.log(`[${timestamp}] HTTP Request: ${context.httpMethod} ${context.httpPath}`);
    }

    // Add custom data to context that will be available in handlers
    context.ctx.requestTimestamp = timestamp;
    context.ctx.requestId = Math.random().toString(36).substring(7);

    // Call next() to proceed to the handler
    const handlerStart = performance.now();
    await next();
    const handlerEnd = performance.now();

    const totalTime = handlerEnd - startTime;
    const dbTime = dbConnectTime - startTime;
    const handlerTime = handlerEnd - handlerStart;

    // You can also run code after the handler executes
    if (context.type === "method") {
        console.log(
            `[${timestamp}] RPC Method ${context.methodName} completed - Total: ${totalTime.toFixed(2)}ms (DB: ${dbTime.toFixed(2)}ms, Handler: ${handlerTime.toFixed(2)}ms)`
        );
    } else if (context.type === "http") {
        console.log(
            `[${timestamp}] HTTP Request ${context.httpMethod} ${context.httpPath} completed - Total: ${totalTime.toFixed(2)}ms (DB: ${dbTime.toFixed(2)}ms, Handler: ${handlerTime.toFixed(2)}ms)`
        );
    }
});
