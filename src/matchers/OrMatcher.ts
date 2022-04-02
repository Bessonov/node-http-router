import {
	IncomingMessage,
	ServerResponse,
} from 'http'
import {
	MatchResult,
	isMatched,
} from './MatchResult'
import {
	Matcher,
} from './Matcher'

export type OrMatcherResult<MR1 extends MatchResult, MR2 extends MatchResult> = MatchResult<{
	or: [MR1, MR2]
}>

/**
 * Match if at least one matcher matches.
 * For completeness both matcher are executed.
 */
export class OrMatcher<MR1 extends MatchResult, MR2 extends MatchResult>
implements Matcher<OrMatcherResult<MR1, MR2>> {
	constructor(private readonly matchers: [Matcher<MR1>, Matcher<MR2>]) {
	}

	match(req: IncomingMessage, res: ServerResponse): OrMatcherResult<MR1, MR2> {
		const [matcher1, matcher2] = this.matchers

		const result1 = matcher1.match(req, res)
		const result2 = matcher2.match(req, res)

		const matched = isMatched(result1) || isMatched(result2)

		if (matched) {
			return {
				matched: true,
				or: [result1, result2],
			}
		}
		return {
			matched: false,
		}
	}
}
