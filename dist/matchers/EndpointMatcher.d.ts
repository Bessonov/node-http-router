import { type Matcher, type MatchResult, type Method, type QueryStringMatch, type QueryStringMatcherInput, type QueryStringResult } from './index.js';
import type { RegExpPathnameMatch, RegExpPathnameResult } from './RegExpPathnameMatcher.js';
export interface EndpointMatcherInput {
    req: {
        url: string;
        method: string;
    };
}
export type EndpointMatchResult<R extends RegExpPathnameMatch, U extends QueryStringMatch> = MatchResult<{
    method: Method;
    pathname: RegExpPathnameResult<R>;
    query: QueryStringResult<U>;
}>;
/**
 * higher order matcher which is combine matching of method
 * with regular expression
 */
export declare class EndpointMatcher<R extends RegExpPathnameMatch, P extends EndpointMatcherInput = EndpointMatcherInput, U extends QueryStringMatch = QueryStringMatch, QP extends QueryStringMatcherInput = QueryStringMatcherInput> implements Matcher<EndpointMatchResult<R, U>, P> {
    private readonly matcher;
    constructor(methods: Method | Method[], urls: RegExp | string | (RegExp | string)[], params?: {
        url?: R;
        query?: U;
    });
    match(params: EndpointMatcherInput): EndpointMatchResult<R, U>;
}
export declare function endpoint<R extends RegExpPathnameMatch, P extends EndpointMatcherInput = EndpointMatcherInput, U extends QueryStringMatch = QueryStringMatch, QP extends QueryStringMatcherInput = QueryStringMatcherInput>(...args: ConstructorParameters<typeof EndpointMatcher<R, P, U, QP>>): EndpointMatcher<R, P, U, QP>;
