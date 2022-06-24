import {
	MatchResult,
	MatchResultAny,
	isMatched,
} from './MatchResult'
import {
	Matcher,
} from './Matcher'

export type OrMatcherResult<MR1 extends MatchResultAny, MR2 extends MatchResultAny> = MatchResult<{
	or: [MR1, MR2]
}>

/**
 * Match if at least one matcher matches.
 * For completeness both matcher are executed.
 */
export class OrMatcher<MR1 extends MatchResultAny, MR2 extends MatchResultAny, P1, P2>
implements Matcher<OrMatcherResult<MR1, MR2>, P1 & P2> {
	constructor(private readonly matchers: [Matcher<MR1, P1>, Matcher<MR2, P2>]) {
		this.match = this.match.bind(this)
	}

	match(params: P1 & P2): OrMatcherResult<MR1, MR2> {
		const [matcher1, matcher2] = this.matchers

		const result1 = matcher1.match(params)
		const result2 = matcher2.match(params)

		const matched = isMatched(result1) || isMatched(result2)

		if (matched) {
			return {
				matched: true,
				result: {
					or: [result1, result2],
				},
			}
		}
		return {
			matched: false,
		}
	}
}
