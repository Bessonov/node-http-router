import type { AnyValidator, Validator } from '../validators.js';
import type { Matcher } from './Matcher.js';
import type { MatchResult } from './MatchResult.js';
export interface QueryStringMatcherInput {
    req: {
        url: string;
    };
}
export type QueryMatch = Record<string, AnyValidator>;
export type QueryResult<T extends QueryMatch> = {
    [P in keyof T]: T[P] extends Validator<string[] | null, infer O> ? O : never;
};
export type QueryStringMatchResult<U extends QueryMatch> = MatchResult<{
    query: QueryResult<U>;
}>;
declare class QueryStringMatcher<U extends QueryMatch, P extends QueryStringMatcherInput> implements Matcher<QueryStringMatchResult<U>, P> {
    private readonly listConfig;
    constructor(config: U);
    match: ({ req }: P) => QueryStringMatchResult<U>;
}
export declare function queryString<U extends QueryMatch, P extends QueryStringMatcherInput>(config: U): QueryStringMatcher<U, P>;
export {};
