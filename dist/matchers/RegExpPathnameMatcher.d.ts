import type { FirstValidator, ValidatorReturnType } from '../validators.js';
import type { Matcher } from './Matcher.js';
import type { MatchResult } from './MatchResult.js';
export interface RegExpPathnameMatcherInput {
    req: {
        url: string;
    };
}
export type RegExpPathnameMatch = Record<string, FirstValidator<string[] | undefined>>;
export type RegExpPathnameResult<T extends RegExpPathnameMatch> = {
    url: string;
    params: {
        [P in keyof T]: ValidatorReturnType<T[P]>;
    };
};
export type RegExpPathnameMatchResult<R extends RegExpPathnameMatch> = MatchResult<{
    pathname: RegExpPathnameResult<R>;
}>;
declare class RegExpPathnameMatcher<R extends RegExpPathnameMatch, P extends RegExpPathnameMatcherInput = RegExpPathnameMatcherInput> implements Matcher<RegExpPathnameMatchResult<R>, P> {
    private readonly listConfig;
    private readonly patterns;
    constructor(urls: RegExp[], config?: R);
    match({ req }: RegExpPathnameMatcherInput): RegExpPathnameMatchResult<R>;
}
export declare function regExpPathname<R extends RegExpPathnameMatch, P extends RegExpPathnameMatcherInput = RegExpPathnameMatcherInput>(urls: RegExp[], config?: R): RegExpPathnameMatcher<R, P>;
export {};
