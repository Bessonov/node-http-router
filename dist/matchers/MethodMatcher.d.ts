import type { Matcher } from './Matcher';
import type { MatchResult } from './MatchResult';
declare const validMethods: readonly ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"];
export interface MethodMatcherInput {
    req: {
        method: string;
    };
}
export type Method = typeof validMethods[number];
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
export {};
