import {
	and,
	type AndMatcher,
	type Matcher,
	type MatchResult,
	type Method,
	method,
	type MethodMatchResult,
	queryString,
	type QueryStringMatch,
	type QueryStringMatcherInput,
	type QueryStringMatchResult,
	type QueryStringResult,
	regExpPathname,
	type RegExpPathnameMatchResult,
} from './index.js'
import type {
	RegExpPathnameMatch,
	RegExpPathnameResult,
} from './RegExpPathnameMatcher.js'

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

export type EndpointMatchResult<R extends RegExpPathnameMatch, U extends QueryStringMatch> = MatchResult<{
	method: Method
	pathname: RegExpPathnameResult<R>
	query: QueryStringResult<U>
}>

// https://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript/3561711#3561711
const escapeRegexRe = /[/\-\\^$*+?.()|[\]{}]/g
function escapeRegex(string: string) {
	return string.replace(escapeRegexRe, '\\$&')
}

/**
 * higher order matcher which is combine matching of method
 * with regular expression
 */
export class EndpointMatcher<
	R extends RegExpPathnameMatch,
	P extends EndpointMatcherInput = EndpointMatcherInput,
	U extends QueryStringMatch = QueryStringMatch,
	QP extends QueryStringMatcherInput = QueryStringMatcherInput,
> implements Matcher<EndpointMatchResult<R, U>, P> {
	private readonly matcher: AndMatcher<
		MethodMatchResult<[Method]>,
		P,
		RegExpPathnameMatchResult<R>,
		P,
		QueryStringMatchResult<U>,
		QP
	>
	constructor(
		methods: Method | Method[],
		urls: RegExp | string | (RegExp | string)[],
		params?: {
			url?: R
			query?: U
		},
	) {
		this.match = this.match.bind(this)
		const regExpUrls = (Array.isArray(urls) ? urls : [urls])
			.map(url => {
				if (typeof url === 'string') {
					return new RegExp(`^${escapeRegex(url)}$`)
				}
				return url
			})
		// @ts-expect-error
		this.matcher = and([
			method(Array.isArray(methods) ? methods : [methods]),
			regExpPathname<R, P>(regExpUrls, params?.url),
			...params?.query ? [queryString<U, QP>(params.query)] : [undefined],
		])
	}

	match(params: EndpointMatcherInput): EndpointMatchResult<R, U> {
		// @ts-expect-error
		const result = this.matcher.match(params)

		if (result.matched) {
			const [methodResult, urlResult, queryResult] = result.result.and
			return {
				matched: true,
				result: {
					method: methodResult.result.method,
					pathname: urlResult.result.pathname,
					...queryResult ? { query: queryResult.result.query } : {},
				},
			} as EndpointMatchResult<R, U>
		}

		return {
			matched: false,
		}
	}
}

export function endpoint<
	R extends RegExpPathnameMatch,
	P extends EndpointMatcherInput = EndpointMatcherInput,
	U extends QueryStringMatch = QueryStringMatch,
	QP extends QueryStringMatcherInput = QueryStringMatcherInput,
>(
	...args: ConstructorParameters<typeof EndpointMatcher<R, P, U, QP>>
): EndpointMatcher<R, P, U, QP> {
	return new EndpointMatcher(...args)
}
