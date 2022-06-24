import {
	Matcher,
} from './Matcher'
import {
	MatchResult,
	MatchResultAny,
	Matched,
	isMatched,
} from './MatchResult'

export type AndMatcherResult<MR1 extends MatchResultAny, MR2 extends MatchResultAny> = MatchResult<{
	and: [Matched<MR1>, Matched<MR2>]
}>

/**
 * Match if every matcher matches
 */
export class AndMatcher<MR1 extends MatchResultAny, MR2 extends MatchResultAny, P1, P2>
implements Matcher<AndMatcherResult<MR1, MR2>, P1 & P2> {
	constructor(private readonly matchers: [Matcher<MR1, P1>, Matcher<MR2, P2>]) {
		this.match = this.match.bind(this)
	}

	match(params: P1 & P2): AndMatcherResult<MR1, MR2> {
		const [matcher1, matcher2] = this.matchers

		const result1 = matcher1.match(params)

		if (isMatched(result1)) {
			const result2 = matcher2.match(params)
			if (isMatched(result2)) {
				return {
					matched: true,
					result: {
						and: [result1, result2],
					},
				}
			}
		}
		return {
			matched: false,
		}
	}
}
