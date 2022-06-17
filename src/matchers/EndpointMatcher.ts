import {
	Matcher,
} from './Matcher'
import {
	MatchResult,
} from './MatchResult'
import {
	Method,
	MethodMatchResult,
	MethodMatcher,
} from './MethodMatcher'
import {
	AndMatcher,
} from './AndMatcher'
import {
	RegExpExecGroupArray,
	RegExpUrlMatchResult,
	RegExpUrlMatcher,
} from './RegExpUrlMatcher'

// waiting for
// https://github.com/microsoft/TypeScript/issues/10571
// https://github.com/microsoft/TypeScript/pull/26349
// to resolve http method

export interface EndpointMatcherInput {
	req: {
		url: string
		method: string
	}
}

export type EndpointMatchResult<R extends object> =
	MatchResult<{
		method: Method
		match: RegExpExecGroupArray<R>
	}>

/**
 * higher order matcher which is combine matching of method
 * with regular expression
 */
export class EndpointMatcher<
	R extends object,
	P extends EndpointMatcherInput = EndpointMatcherInput
>
implements Matcher<EndpointMatchResult<R>, P> {
	private readonly matcher: AndMatcher<MethodMatchResult<[Method]>, RegExpUrlMatchResult<R>, P, P>
	constructor(methods: Method | Method[], url: RegExp) {
		this.match = this.match.bind(this)
		this.matcher = new AndMatcher([
			new MethodMatcher(Array.isArray(methods) ? methods : [methods]),
			new RegExpUrlMatcher<R, P>([url]),
		])
	}

	match(params: EndpointMatcherInput): EndpointMatchResult<R> {
		// @ts-expect-error
		const result = this.matcher.match(params)

		if (result.matched) {
			const [methodResult, urlResult] = result.result.and
			return {
				matched: true,
				result: {
					method: methodResult.result.method,
					match: urlResult.result.match,
				},
			}
		}

		return {
			matched: false,
		}
	}
}
