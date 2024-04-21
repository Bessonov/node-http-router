import type { Matcher } from './Matcher';
import type { MatchResult } from './MatchResult';
/**
 * @deprecated
 */
export interface RegExpUrlMatcherInput {
    req: {
        url: string;
    };
}
/**
 * @deprecated
 */
export interface RegExpExecGroupArray<T extends object> extends Array<string> {
    index: number;
    input: string;
    groups: T;
}
/**
 * @deprecated
 */
export type RegExpUrlMatchResult<R extends object> = MatchResult<{
    match: RegExpExecGroupArray<R>;
}>;
/**
 * @deprecated
 */
export declare class RegExpUrlMatcher<R extends object, P extends RegExpUrlMatcherInput = RegExpUrlMatcherInput> implements Matcher<RegExpUrlMatchResult<R>, P> {
    private readonly urls;
    constructor(urls: RegExp[]);
    match({ req }: RegExpUrlMatcherInput): RegExpUrlMatchResult<R>;
}
