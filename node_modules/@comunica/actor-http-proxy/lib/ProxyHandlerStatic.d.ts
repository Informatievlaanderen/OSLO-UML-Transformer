import type { IProxyHandler, IRequest } from '@comunica/types';
/**
 * A proxy handler that prefixes all URLs with a given string.
 */
export declare class ProxyHandlerStatic implements IProxyHandler {
    private readonly prefixUrl;
    constructor(prefixUrl: string);
    getProxy(request: IRequest): Promise<IRequest>;
    modifyInput(input: RequestInfo): RequestInfo;
}
