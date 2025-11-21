export type MethodStub<TArgs = unknown, TResult = unknown> = {
    __id: string;
    __args?: TArgs;
    __result?: TResult;
};
