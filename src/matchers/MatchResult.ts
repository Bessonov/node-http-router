type MatchedResult = {
	matched: true
}

type UnmatchedResult = {
	matched: false
}

export type MatchResult<T = Record<string, unknown>> = UnmatchedResult | MatchedResult & T

/**
 * reperesent matcher result which is matched
 */
export type Matched<MR extends MatchResult> = Extract<MR, MatchedResult>

/**
 * check for matched result
 */
export function isMatched<MR extends MatchResult>(matchResult: MR): matchResult is Matched<MR> {
	return matchResult.matched
}
