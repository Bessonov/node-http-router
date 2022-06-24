import {
	Matcher,
} from './Matcher'
import {
	MatchResult,
} from './MatchResult'

export interface RegExpUrlMatcherInput {
	req: {
		url: string
	}
}

export interface RegExpExecGroupArray<
	T extends object
> extends Array<string> {
	index: number
	input: string
	groups: T
}

export type RegExpUrlMatchResult<R extends object> = MatchResult<{
	match: RegExpExecGroupArray<R>
}>

export class RegExpUrlMatcher<
	R extends object,
	P extends RegExpUrlMatcherInput = RegExpUrlMatcherInput
>
implements Matcher<RegExpUrlMatchResult<R>, P> {
	constructor(private readonly urls: RegExp[]) {
		this.match = this.match.bind(this)
	}

	match({ req }: RegExpUrlMatcherInput): RegExpUrlMatchResult<R> {
		for (const url of this.urls) {
			const result = url.exec(req.url) as never as RegExpExecGroupArray<R>
			if (result !== null) {
				return {
					matched: true,
					result: {
						match: result,
					},
				}
			}
		}

		return {
			matched: false,
		}
	}
}
