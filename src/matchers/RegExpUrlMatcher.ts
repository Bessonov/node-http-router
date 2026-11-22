import type {
	Matcher,
} from './Matcher.js'
import type {
	MatchResult,
} from './MatchResult.js'

/**
 * @deprecated Use `RegExpPathnameMatcherInput` with `regExpPathname`.
 */
export interface RegExpUrlMatcherInput {
	req: {
		url: string
	}
}

/**
 * @deprecated Use `regExpPathname` and access validated captures through `pathname.params`.
 */
export interface RegExpExecGroupArray<
	T extends object,
> extends Array<string> {
	index: number
	input: string
	groups: T
}

/**
 * @deprecated Use `RegExpPathnameMatchResult`.
 */
export type RegExpUrlMatchResult<R extends object> = MatchResult<{
	match: RegExpExecGroupArray<R>
}>

/**
 * @deprecated Use `regExpPathname` for paths and `queryString` for query parameters.
 */
export class RegExpUrlMatcher<
	R extends object,
	P extends RegExpUrlMatcherInput = RegExpUrlMatcherInput,
> implements Matcher<RegExpUrlMatchResult<R>, P> {
	constructor(private readonly urls: RegExp[]) {
		this.match = this.match.bind(this)
	}

	match({ req }: RegExpUrlMatcherInput): RegExpUrlMatchResult<R> {
		for (const url of this.urls) {
			const result = new RegExp(url).exec(req.url)
			if (result !== null) {
				return {
					matched: true,
					result: {
						match: result as unknown as RegExpExecGroupArray<R>,
					},
				}
			}
		}

		return {
			matched: false,
		}
	}
}
