export type MatchedResult<M> = {
	matched: true
	result: M
}

export type UnmatchedResult = {
	matched: false
}

export type MatchResult<R> = UnmatchedResult | MatchedResult<R>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MatchResultAny = MatchResult<any>

/**
 * reperesent matcher result which is matched
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Matched<MR extends MatchResultAny> = Extract<MR, MatchedResult<any>>

/**
 * check for matched result
 */
export function isMatched<MR extends MatchResultAny>(matchResult: MR): matchResult is Matched<MR> {
	return matchResult.matched
}
