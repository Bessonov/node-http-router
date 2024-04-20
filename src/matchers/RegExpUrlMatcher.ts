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

// https://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript/3561711#3561711
const escapeRegexRe = /[/\-\\^$*+?.()|[\]{}]/g
function escapeRegex(string: string) {
	return string.replace(escapeRegexRe, '\\$&')
}

export class RegExpUrlMatcher<
	R extends object,
	P extends RegExpUrlMatcherInput = RegExpUrlMatcherInput,
> implements Matcher<RegExpUrlMatchResult<R>, P> {
	readonly regExps: RegExp[]

	constructor(private readonly urls: (RegExp | string)[]) {
		this.match = this.match.bind(this)
		this.regExps = urls.map(url => {
			if (typeof url === 'string') {
				return new RegExp(escapeRegex(url))
			}
			return url
		})
	}

	match({ req }: RegExpUrlMatcherInput): RegExpUrlMatchResult<R> {
		// original URL returns '/' if pathname is empty
		const pathname = Url.parse(req.url).pathname ?? '/'
		for (const url of this.regExps) {
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
>(urls: (RegExp | string)[]): RegExpUrlMatcher<R, P> {
	return new RegExpUrlMatcher(urls)
}
