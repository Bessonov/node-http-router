import type { Matcher } from './Matcher.js';
import type { MatchResult } from './MatchResult.js';
export declare class BooleanMatcher<T extends boolean> implements Matcher<MatchResult<T>, void> {
    private value;
    constructor(value: T);
    match(): MatchResult<T>;
}
export declare function bool<T extends boolean>(value: T): BooleanMatcher<T>;
