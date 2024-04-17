import type { Matcher } from './Matcher';
import type { MatchResult } from './MatchResult';
export interface ExactUrlPathnameMatcherInput {
    req: {
        url: string;
    };
}
export type ExactUrlPathnameMatchResult<U extends [string, ...string[]]> = MatchResult<{
    pathname: U[number];
}>;
/**
 * Match exact urls
 */
export declare class ExactUrlPathnameMatcher<U extends [string, ...string[]], P extends ExactUrlPathnameMatcherInput> implements Matcher<ExactUrlPathnameMatchResult<U>, P> {
    private readonly urls;
    constructor(urls: U);
    match({ req }: P): ExactUrlPathnameMatchResult<U>;
}
export declare function exactUrlPathname<U extends [string, ...string[]], P extends ExactUrlPathnameMatcherInput>(urls: U): ExactUrlPathnameMatcher<U, P>;
