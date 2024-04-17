/// <reference types="node" />
import { IncomingMessage, ServerResponse } from 'http';
import type { MatchResult, MatchedResult } from '../matchers';
import { type Handler, Router } from '../Router';
import { type ServerRequest } from './ServerRequest';
interface ServerRequestResponse {
    req: ServerRequest;
    res: ServerResponse;
}
export interface NodeHttpRouterParams<MR> {
    data: ServerRequestResponse;
    match: MatchedResult<MR>;
}
export declare class NodeHttpRouter extends Router<ServerRequestResponse> {
    constructor(defaultHandler?: Handler<MatchResult<unknown>, ServerRequestResponse>);
    serve(req: IncomingMessage, res: ServerResponse): any;
}
export {};
