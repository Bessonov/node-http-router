import type { MatchResultAny } from './MatchResult.js';
export type ExtractMatchResult<M> = M extends Matcher<infer MR, any> ? MR : never;
export interface Matcher<T extends MatchResultAny, P> {
    match(params: P): T;
}
