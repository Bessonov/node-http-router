import { U } from 'ts-toolbelt'

type MatchedResult = {
	matched: true
}

type UnmatchedResult = {
	matched: false
}

export type MatchResult<T = {}> = UnmatchedResult | MatchedResult & T

/**
 * reperesent matcher result which is matched
 */
export type Matched<MR extends MatchResult> = U.Select<MR, MatchedResult>

/**
 * check for matched result
 */
export function isMatched<MR extends MatchResult>(matchResult: MR): matchResult is Matched<MR> {
	return matchResult.matched
}
