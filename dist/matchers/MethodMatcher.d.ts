import type { Matcher } from './Matcher.js';
import type { MatchResult } from './MatchResult.js';
export interface MethodMatcherInput {
    req: {
        method: string;
    };
}
export type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS';
export type MethodMatchResult<M extends Method[]> = MatchResult<{
    method: M[number];
}>;
/**
 * Match methods
 */
export declare class MethodMatcher<M extends Method[], P extends MethodMatcherInput> implements Matcher<MethodMatchResult<M>, P> {
    private readonly methods;
    constructor(methods: M);
    match({ req }: MethodMatcherInput): MethodMatchResult<M>;
}
export declare function method<M extends Method[], P extends MethodMatcherInput>(methods: M): MethodMatcher<M, P>;
