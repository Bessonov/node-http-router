import {
	and,
	type AndMatcher,
	type Matcher,
	type MatchResult,
	type Method,
	method,
	type MethodMatchResult,
	regExpUrl,
	type RegExpUrlMatchResult,
} from './index.js'
import type {
	RegExpExecGroupArray,
} from './RegExpUrlMatcher.js'

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

export type EndpointMatchResult<R extends object> = MatchResult<{
	method: Method
	match: RegExpExecGroupArray<R>
}>

/**
 * higher order matcher which is combine matching of method
 * with regular expression
 */
export class EndpointMatcher<
	R extends object,
	P extends EndpointMatcherInput = EndpointMatcherInput,
> implements Matcher<EndpointMatchResult<R>, P> {
	private readonly matcher: AndMatcher<
		MethodMatchResult<[Method]>,
		P,
		RegExpUrlMatchResult<R>,
		P
	>
	constructor(methods: Method | Method[], urls: RegExp | string | (RegExp | string)[]) {
		this.match = this.match.bind(this)
		this.matcher = and([
			method(Array.isArray(methods) ? methods : [methods]),
			regExpUrl<R, P>(Array.isArray(urls) ? urls : [urls]),
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

export function endpoint<
	R extends object,
	P extends EndpointMatcherInput = EndpointMatcherInput,
>(
	...args: ConstructorParameters<typeof EndpointMatcher<R, P>>
): EndpointMatcher<R, P> {
	return new EndpointMatcher(...args)
}
