import Url from 'urlite'
import type {
	Matcher,
} from './Matcher.js'
import type {
	MatchResult,
} from './MatchResult.js'

export interface RegExpUrlMatcherInput {
	req: {
		url: string
	}
}

export interface RegExpExecGroupArray<
	T extends object,
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
	P extends RegExpUrlMatcherInput = RegExpUrlMatcherInput,
> implements Matcher<RegExpUrlMatchResult<R>, P> {
	constructor(private readonly urls: RegExp[]) {
		this.match = this.match.bind(this)
	}

	match({ req }: RegExpUrlMatcherInput): RegExpUrlMatchResult<R> {
		// original URL returns '/' if pathname is empty
		const pathname = Url.parse(req.url).pathname ?? '/'
		for (const url of this.urls) {
			const result = url.exec(pathname) as unknown as RegExpExecGroupArray<R>
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

export function regExpUrl<
	R extends object,
	P extends RegExpUrlMatcherInput = RegExpUrlMatcherInput,
>(urls: RegExp[]): RegExpUrlMatcher<R, P> {
	return new RegExpUrlMatcher(urls)
}
