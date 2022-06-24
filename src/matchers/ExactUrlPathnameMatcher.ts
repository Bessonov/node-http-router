import Url from 'urlite'
import {
	Matcher,
} from './Matcher'
import {
	MatchResult,
} from './MatchResult'

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
	P extends ExactUrlPathnameMatcherInput
>
implements Matcher<ExactUrlPathnameMatchResult<U>, P> {
	constructor(private readonly urls: U) {
		this.match = this.match.bind(this)
	}

	match({ req }: P): ExactUrlPathnameMatchResult<U> {
		/* istanbul ignore else */
		// original URL returns '/' if pathname is empty
		const pathname = Url.parse(req.url).pathname ?? '/'
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
