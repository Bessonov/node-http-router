import type { FirstValidator, ValidatorReturnType } from '../validators.js';
import type { Matcher } from './Matcher.js';
import type { MatchResult } from './MatchResult.js';
export interface QueryStringMatcherInput {
    req: {
        url: string;
    };
}
export type QueryStringMatch = Record<string, FirstValidator<string[] | undefined>>;
export type QueryStringResult<T extends QueryStringMatch> = {
    [P in keyof T]: ValidatorReturnType<T[P]>;
};
export type QueryStringMatchResult<U extends QueryStringMatch> = MatchResult<{
    query: QueryStringResult<U>;
}>;
declare class QueryStringMatcher<U extends QueryStringMatch, P extends QueryStringMatcherInput> implements Matcher<QueryStringMatchResult<U>, P> {
    private readonly listConfig;
    constructor(config: U);
    match: ({ req }: P) => QueryStringMatchResult<U>;
}
export declare function queryString<U extends QueryStringMatch, P extends QueryStringMatcherInput>(config: U): QueryStringMatcher<U, P>;
export {};
