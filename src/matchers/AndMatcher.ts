import {
	IncomingMessage,
	ServerResponse,
} from 'http'
import {
	MatchResult,
	Matched,
	Matcher,
	isMatched,
} from '.'

export type AndMatcherResult<MR1 extends MatchResult, MR2 extends MatchResult> = MatchResult<{
	and: [Matched<MR1>, Matched<MR2>]
}>

/**
 * Match if every matcher matches
 */
export class AndMatcher<MR1 extends MatchResult, MR2 extends MatchResult>
implements Matcher<AndMatcherResult<MR1, MR2>> {
	constructor(private readonly matchers: [Matcher<MR1>, Matcher<MR2>]) {
	}

	match(req: IncomingMessage, res: ServerResponse): AndMatcherResult<MR1, MR2> {
		const [matcher1, matcher2] = this.matchers

		const result1 = matcher1.match(req, res)

		if (isMatched(result1)) {
			const result2 = matcher2.match(req, res)
			if (isMatched(result2)) {
				return {
					matched: true,
					and: [result1, result2],
				}
			}
		}
		return {
			matched: false,
		}
	}
}
