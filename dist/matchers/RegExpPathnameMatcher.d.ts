import type { AnyValidator, Validator } from '../index.js';
import type { Matcher } from './Matcher.js';
import type { MatchResult } from './MatchResult.js';
export interface RegExpPathnameMatcherInput {
    req: {
        url: string;
    };
}
export type RegExpMatch = Record<string, AnyValidator>;
export type RegExpResult<T extends RegExpMatch> = {
    url: string;
    params: {
        [P in keyof T]: T[P] extends Validator<string[] | null, infer O> ? O : never;
    };
};
export type RegExpPathnameMatchResult<R extends RegExpMatch> = MatchResult<{
    pathname: RegExpResult<R>;
}>;
declare class RegExpPathnameMatcher<R extends RegExpMatch, P extends RegExpPathnameMatcherInput = RegExpPathnameMatcherInput> implements Matcher<RegExpPathnameMatchResult<R>, P> {
    private readonly urls;
    private readonly listConfig;
    constructor(urls: RegExp[], config?: R);
    match({ req }: RegExpPathnameMatcherInput): RegExpPathnameMatchResult<R>;
}
export declare function regExpPathname<R extends RegExpMatch, P extends RegExpPathnameMatcherInput = RegExpPathnameMatcherInput>(urls: RegExp[], config?: R): RegExpPathnameMatcher<R, P>;
export {};
