import type { Matcher } from './Matcher.js';
import type { MatchResult } from './MatchResult.js';
/**
 * @deprecated
 */
export interface ExactQueryMatcherInput {
    req: {
        url: string;
    };
}
type QueryMatch = {
    [key: string]: readonly string[] | true | false | undefined;
};
type QueryResult<T> = {
    [P in keyof T]: T[P] extends true ? string : T[P] extends false ? never : T[P] extends undefined ? string | undefined : T[P] extends readonly string[] ? T[P][number] : never;
};
/**
 * @deprecated
 */
export type ExactQueryMatchResult<U extends QueryMatch> = MatchResult<{
    query: QueryResult<U>;
}>;
/**
 * Match query params
 *
 * key is a string and value:
 * true: must be present
 * false: must be absent
 * undefined: optional
 * 'some string': must be exact value
 * @deprecated
 */
export declare class ExactQueryMatcher<U extends QueryMatch, P extends ExactQueryMatcherInput> implements Matcher<ExactQueryMatchResult<U>, P> {
    private readonly listConfig;
    constructor(config: U);
    match({ req }: P): ExactQueryMatchResult<U>;
}
/**
 * @deprecated
 */
export declare function exactQuery<U extends QueryMatch, P extends ExactQueryMatcherInput>(config: U): ExactQueryMatcher<U, P>;
export {};
