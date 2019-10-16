import { IncomingMessage } from 'http'
import Url from 'fast-url-parser'
import { Matcher } from './Matcher'
import { MatchResult } from './MatchResult'

export type ExactUrlPathnameMatchResult<U extends [string, ...string[]]> = MatchResult<{
	pathname: U[number]
}>

/**
 * Match exact urls
 */
export class ExactUrlPathnameMatcher<U extends [string, ...string[]]>
implements Matcher<ExactUrlPathnameMatchResult<U>> {
	constructor(private readonly urls: U) {
	}

	match(req: IncomingMessage): ExactUrlPathnameMatchResult<U> {
		/* istanbul ignore else */
		if (req.url !== undefined) {
			const { pathname } = Url.parse(req.url)
			if (pathname !== undefined && this.urls.indexOf(pathname) >= 0) {
				return {
					matched: true,
					pathname,
				}
			}
		}
		return {
			matched: false,
		}
	}
}
