/// <reference types="node" />
import { IncomingMessage, ServerResponse } from 'http';
import type { MatchedResult, MatchResult } from '../matchers/index.js';
import { type Handler, Router } from '../Router.js';
import { type ServerRequest } from './ServerRequest.js';
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
