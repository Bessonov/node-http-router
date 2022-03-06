import {
	IncomingMessage,
	ServerResponse,
} from 'http'
import { Matcher } from './Matcher'
import { MatchResult } from './MatchResult'
import {
	Method,
	MethodMatchResult,
	MethodMatcher,
} from './MethodMatcher'
import { AndMatcher } from './AndMatcher'
import {
	RegExpExecGroupArray,
	RegExpUrlMatchResult,
	RegExpUrlMatcher,
} from './RegExpUrlMatcher'

// waiting for
// https://github.com/microsoft/TypeScript/issues/10571
// https://github.com/microsoft/TypeScript/pull/26349
// to resolve http method

export type EndpointMatchResult<R extends object> =
MatchResult<{
	method: Method
	match: RegExpExecGroupArray<R>
}>

/**
 * higher order matcher which is combine matching of method
 * with regular expression
 */
export class EndpointMatcher<R extends object>
implements Matcher<EndpointMatchResult<R>> {
	private readonly matcher: AndMatcher<MethodMatchResult<[Method]>, RegExpUrlMatchResult<R>>
	constructor(method: Method, url: RegExp) {
		this.matcher = new AndMatcher([
			new MethodMatcher([method]),
			new RegExpUrlMatcher<R>([url]),
		])
	}

	match(req: IncomingMessage, res: ServerResponse): EndpointMatchResult<R> {
		const result = this.matcher.match(req, res)

		if (result.matched) {
			const [methodResult, urlResult] = result.and
			return {
				matched: true,
				method: methodResult.method,
				match: urlResult.match,
			}
		}

		return {
			matched: false,
		}
	}
}
