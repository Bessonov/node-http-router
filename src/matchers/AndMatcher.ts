import type {
	Matcher,
} from './Matcher'
import {
	type MatchResult,
	type MatchResultAny,
	type Matched,
	isMatched,
} from './MatchResult'

export type AndMatcherResult<
	MR1 extends MatchResultAny,
	MR2 extends MatchResultAny,
	MR3 extends MatchResultAny | never = never
> = MatchResult<{
	and: [Matched<MR1>, Matched<MR2>, MR3 extends void ? void : Matched<MR3>]
}>

/**
 * Match if every matcher matches
 */
export class AndMatcher<
	MR1 extends MatchResultAny,
	MR2 extends MatchResultAny,
	P1,
	P2,
	MR3 extends MatchResultAny | never = never,
	P3 = unknown>
implements Matcher<AndMatcherResult<MR1, MR2, MR3>, P1 & P2 & P3> {
	constructor(private readonly matchers: [Matcher<MR1, P1>, Matcher<MR2, P2>, Matcher<MR3, P3>?]) {
		this.match = this.match.bind(this)
	}

	match(params: P1 & P2 & P3): AndMatcherResult<MR1, MR2, MR3> {
		const [matcher1, matcher2, matcher3] = this.matchers

		const result1 = matcher1.match(params)
		if (isMatched(result1)) {
			const result2 = matcher2.match(params)
			if (isMatched(result2)) {
				if (matcher3) {
					const result3 = matcher3.match(params)
					if (isMatched(result3)) {
						return {
							matched: true,
							result: {
								and: [result1, result2, result3 as never],
							},
						}
					}
				}

				return {
					matched: true,
					result: {
						and: [result1, result2] as unknown as [
							Matched<MR1>,
							Matched<MR2>,
							MR3 extends void ? void : Matched<MR3>
						],
					},
				}
			}
		}
		return {
			matched: false,
		}
	}
}
