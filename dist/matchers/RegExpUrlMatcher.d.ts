import type { Matcher } from './Matcher.js';
import type { MatchResult } from './MatchResult.js';
export interface RegExpUrlMatcherInput {
    req: {
        url: string;
    };
}
export interface RegExpExecGroupArray<T extends object> extends Array<string> {
    index: number;
    input: string;
    groups: T;
}
export type RegExpUrlMatchResult<R extends object> = MatchResult<{
    match: RegExpExecGroupArray<R>;
}>;
export declare class RegExpUrlMatcher<R extends object, P extends RegExpUrlMatcherInput = RegExpUrlMatcherInput> implements Matcher<RegExpUrlMatchResult<R>, P> {
    private readonly urls;
    readonly regExps: RegExp[];
    constructor(urls: (RegExp | string)[]);
    match({ req }: RegExpUrlMatcherInput): RegExpUrlMatchResult<R>;
}
export declare function regExpUrl<R extends object, P extends RegExpUrlMatcherInput = RegExpUrlMatcherInput>(urls: (RegExp | string)[]): RegExpUrlMatcher<R, P>;
