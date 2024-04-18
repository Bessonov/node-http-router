import type { Matcher } from './Matcher.js';
import type { MatchResult } from './MatchResult.js';
import { type Method } from './MethodMatcher.js';
import { type RegExpExecGroupArray } from './RegExpUrlMatcher.js';
export interface EndpointMatcherInput {
    req: {
        url: string;
        method: string;
    };
}
export type EndpointMatchResult<R extends object> = MatchResult<{
    method: Method;
    match: RegExpExecGroupArray<R>;
}>;
/**
 * higher order matcher which is combine matching of method
 * with regular expression
 */
export declare class EndpointMatcher<R extends object, P extends EndpointMatcherInput = EndpointMatcherInput> implements Matcher<EndpointMatchResult<R>, P> {
    private readonly matcher;
    constructor(methods: Method | Method[], url: RegExp);
    match(params: EndpointMatcherInput): EndpointMatchResult<R>;
}
export declare function endpoint<R extends object, P extends EndpointMatcherInput = EndpointMatcherInput>(methods: Method | Method[], url: RegExp): EndpointMatcher<R, P>;
