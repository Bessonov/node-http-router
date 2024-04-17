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
	MR1 extends MatchResultAny | never = never,
	MR2 extends MatchResultAny | never = never,
	MR3 extends MatchResultAny | never = never,
	MR4 extends MatchResultAny | never = never,
	MR5 extends MatchResultAny | never = never,
> = MatchResult<{
	and: [
		MR1 extends MatchResultAny ? Matched<MR1> : Partial<void>,
		MR2 extends MatchResultAny ? Matched<MR2> : Partial<void>,
		MR3 extends MatchResultAny ? Matched<MR3> : Partial<void>,
		MR4 extends MatchResultAny ? Matched<MR4> : Partial<void>,
		MR5 extends MatchResultAny ? Matched<MR5> : Partial<void>,
	]
}>

/**
 * Match if every matcher matches
 */
export class AndMatcher<
	MR1 extends MatchResultAny | never = never,
	P1 = unknown,
	MR2 extends MatchResultAny | never = never,
	P2 = unknown,
	MR3 extends MatchResultAny | never = never,
	P3 = unknown,
	MR4 extends MatchResultAny | never = never,
	P4 = unknown,
	MR5 extends MatchResultAny | never = never,
	P5 = unknown,
>
implements Matcher<AndMatcherResult<
MR1,
MR2,
MR3,
MR4,
MR5
>, P1 & P2 & P3 & P4 & P5> {
	constructor(private readonly matchers: [
		Matcher<MR1, P1>?,
		Matcher<MR2, P2>?,
		Matcher<MR3, P3>?,
		Matcher<MR4, P4>?,
		Matcher<MR5, P5>?
	]) {
		this.match = this.match.bind(this)
	}

	match(params: P1 & P2 & P3 & P4 & P5): AndMatcherResult<
	MR1 | never,
	MR2 | never,
	MR3 | never,
	MR4 | never,
	MR5 | never
	> {
		type Result = MR1 | MR2 | MR3 | MR4 | MR5 | undefined
		const results: Result[] = []
		for (const matcher of this.matchers) {
			let result: Result
			if (matcher) {
				result = matcher.match(params)
				if (isMatched(result) === false) {
					return {
						matched: false,
					}
				}
			}
			results.push(result)
		}

		return {
			matched: true,
			result: {
				// @ts-expect-error
				and: results,
			},
		}
	}
}
