import Url from 'urlite'
import type {
	AnyValidator,
	Validator,
} from '../index.js'
import type {
	Matcher,
} from './Matcher.js'
import type {
	MatchResult,
} from './MatchResult.js'

export interface RegExpPathnameMatcherInput {
	req: {
		url: string
	}
}

export type RegExpMatch = Record<string, AnyValidator>

export type RegExpResult<T extends RegExpMatch> = {
	url: string
	params: {
		[P in keyof T]: T[P] extends Validator<string[] | null, infer O> ? O : never
	}
}

export type RegExpPathnameMatchResult<R extends RegExpMatch> = MatchResult<{
	pathname: RegExpResult<R>
}>

class RegExpPathnameMatcher<
	R extends RegExpMatch,
	P extends RegExpPathnameMatcherInput = RegExpPathnameMatcherInput,
> implements Matcher<RegExpPathnameMatchResult<R>, P> {
	private readonly listConfig: [string, AnyValidator][]

	constructor(private readonly urls: RegExp[], config?: R) {
		this.match = this.match.bind(this)
		this.listConfig = Object.entries(config ?? {})
	}

	match({ req }: RegExpPathnameMatcherInput): RegExpPathnameMatchResult<R> {
		// original URL returns '/' if pathname is empty
		const pathname = Url.parse(req.url).pathname ?? '/'
		urlLoop: for (const url of this.urls) {
			const extractedValues: Record<string, string[]> = {}
			let m: RegExpExecArray | null
			let matchedUrl: string | undefined
			let lastIndex = 0
			// eslint-disable-next-line no-cond-assign
			while ((m = url.exec(pathname)) !== null) {
				matchedUrl = m.input
				const [wholeMatch, matched] = m
				extractedValues[0] = (extractedValues[0] ?? []).concat(wholeMatch)
				if (matched !== undefined) {
					extractedValues[1] = (extractedValues[1] ?? []).concat(matched)
					for (const [key, value] of Object.entries(m.groups ?? {})) {
						extractedValues[key] = (extractedValues[key] ?? []).concat(value)
					}
				}

				/* istanbul ignore else */
				if (url.flags.includes('g') === false && url.flags.includes('y') === false) {
					// the RegExp is stateless without global and sticky flag.
					// Therefore, we stop the loop to avoid infinity loop
					break
				} else if (lastIndex === url.lastIndex) {
					// avoid inifinity loop with empty match. See the warning in:
					// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec#finding_successive_matches
					url.lastIndex = +1
				}
				lastIndex = url.lastIndex
			}

			if (matchedUrl === undefined) {
				continue
			}
			if (this.listConfig.length === 0) {
				return {
					matched: true,
					result: {
						pathname: {
							url: matchedUrl,
						},
					},
				} as RegExpPathnameMatchResult<R>
			}
			const matchResult = {} as RegExpResult<R>['params']
			for (const [key, matcher] of this.listConfig) {
				const params = extractedValues[key]
				const getter = matcher(params)
				if (getter === undefined) {
					continue urlLoop
				}
				// @ts-expect-error
				matchResult[key] = getter()
			}

			return {
				matched: true,
				result: {
					pathname: {
						url: matchedUrl,
						params: matchResult,
					},
				},
			}
		}

		return {
			matched: false,
		}
	}
}

export function regExpPathname<
	R extends RegExpMatch,
	P extends RegExpPathnameMatcherInput = RegExpPathnameMatcherInput,
>(urls: RegExp[], config?: R): RegExpPathnameMatcher<R, P> {
	return new RegExpPathnameMatcher(urls, config)
}
