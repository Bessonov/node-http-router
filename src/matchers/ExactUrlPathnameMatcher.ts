import type {
	Matcher,
} from './Matcher.js'
import type {
	MatchResult,
} from './MatchResult.js'
import {
	getRequestPathname,
} from './parseRequestTarget.js'

export interface ExactUrlPathnameMatcherInput {
	req: {
		url: string
	}
}

export type ExactUrlPathnameMatchResult<U extends [string, ...string[]]> = MatchResult<{
	pathname: U[number]
}>

/**
 * Match exact urls
 */
export class ExactUrlPathnameMatcher<
	U extends [string, ...string[]],
	P extends ExactUrlPathnameMatcherInput,
> implements Matcher<ExactUrlPathnameMatchResult<U>, P> {
	constructor(private readonly urls: U) {
		this.match = this.match.bind(this)
	}

	match({ req }: P): ExactUrlPathnameMatchResult<U> {
		const pathname = getRequestPathname(req.url)
		if (this.urls.indexOf(pathname) >= 0) {
			return {
				matched: true,
				result: {
					pathname,
				},
			}
		}
		return {
			matched: false,
		}
	}
}

export function exactUrlPathname<
	U extends [string, ...string[]],
	P extends ExactUrlPathnameMatcherInput,
>(urls: U): ExactUrlPathnameMatcher<U, P> {
	return new ExactUrlPathnameMatcher(urls)
}
