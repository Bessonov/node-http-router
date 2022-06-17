import {
	MatchResultAny,
} from './MatchResult'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ExtractMatchResult<M> = M extends Matcher<infer MR, any> ? MR : never

export interface Matcher<T extends MatchResultAny, P> {
	match(params: P): T
}
