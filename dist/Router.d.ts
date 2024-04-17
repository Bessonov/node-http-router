import { type Matched, type Matcher } from './matchers';
import { type MatchResult, type MatchResultAny } from './matchers/MatchResult';
interface HandlerParams<MR extends MatchResultAny, D> {
    match: Matched<MR>;
    data: D;
}
export type MatchedHandler<M extends Matcher<MatchResultAny, any>, D = any> = Handler<ReturnType<M['match']>, D>;
export type Handler<MR extends MatchResultAny, D> = (params: HandlerParams<MR, D>) => any;
export interface Route<MR extends MatchResultAny, D> {
    matcher: Matcher<MR, D>;
    handler: Handler<MR, D>;
}
export declare class Router<D> {
    private defaultHandler?;
    private routes;
    constructor(defaultHandler?: Handler<MatchResult<unknown>, D> | undefined);
    addRoute<MR extends MatchResultAny>(route: Route<MR, D>): void;
    exec(params: D): ReturnType<Handler<any, D>>;
}
export {};
