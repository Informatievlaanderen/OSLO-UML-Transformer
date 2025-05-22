import type { MediatorHttp } from '@comunica/bus-http';
import type { IActionContext } from '@comunica/types';
import { FetchDocumentLoader } from 'jsonld-context-parser';
/**
 * A JSON-LD document loader that fetches over an HTTP bus using a given mediator.
 */
export declare class DocumentLoaderMediated extends FetchDocumentLoader {
    private readonly mediatorHttp;
    private readonly context;
    constructor(mediatorHttp: MediatorHttp, context: IActionContext);
    protected static createFetcher(mediatorHttp: MediatorHttp, context: IActionContext): (input: RequestInfo, init: RequestInit) => Promise<Response>;
}
