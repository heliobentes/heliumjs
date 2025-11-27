export type RpcRequest = {
    id: string | number;
    method: string;
    args?: unknown;
};

export type RpcStats = {
    remainingRequests: number;
    resetInSeconds: number;
};

export type RpcSuccess = {
    id: string | number;
    ok: true;
    stats: RpcStats;
    result: unknown;
};

export type RpcError = {
    id: string | number;
    ok: false;
    stats: RpcStats;
    error: string;
};

export type RpcResponse = RpcSuccess | RpcError;

export type RpcBatchRequest = RpcRequest[];
export type RpcBatchResponse = RpcResponse[];
