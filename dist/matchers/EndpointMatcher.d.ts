import { type Matcher, type MatchResult, type Method, type QueryMatch, type QueryResult, type QueryStringMatcherInput } from './index.js';
import type { RegExpMatch, RegExpResult } from './RegExpPathnameMatcher.js';
export interface EndpointMatcherInput {
    req: {
        url: string;
        method: string;
    };
}
export type EndpointMatchResult<R extends RegExpMatch, U extends QueryMatch> = MatchResult<{
    method: Method;
    pathname: RegExpResult<R>;
    query: QueryResult<U>;
}>;
/**
 * higher order matcher which is combine matching of method
 * with regular expression
 */
export declare class EndpointMatcher<R extends RegExpMatch, P extends EndpointMatcherInput = EndpointMatcherInput, U extends QueryMatch = QueryMatch, QP extends QueryStringMatcherInput = QueryStringMatcherInput> implements Matcher<EndpointMatchResult<R, U>, P> {
    private readonly matcher;
    constructor(methods: Method | Method[], urls: RegExp | string | (RegExp | string)[], params?: {
        url?: R;
        query?: U;
    });
    match(params: EndpointMatcherInput): EndpointMatchResult<R, U>;
}
export declare function endpoint<R extends RegExpMatch, P extends EndpointMatcherInput = EndpointMatcherInput, U extends QueryMatch = QueryMatch, QP extends QueryStringMatcherInput = QueryStringMatcherInput>(...args: ConstructorParameters<typeof EndpointMatcher<R, P, U, QP>>): EndpointMatcher<R, P, U, QP>;
