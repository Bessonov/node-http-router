import type {
	Matcher,
} from './Matcher.js'
import type {
	MatchResult,
} from './MatchResult.js'
import {
	getRequestSearch,
} from './parseRequestTarget.js'

/**
 * @deprecated Use `QueryStringMatcherInput` with `queryString`.
 */
export interface ExactQueryMatcherInput {
	req: {
		url: string
	}
}

type QueryMatch = { [key: string]: readonly string[] | true | false | undefined }

type QueryResult<T> = {
	[P in keyof T]: T[P] extends true ? string
		: T[P] extends false ? never
		: T[P] extends undefined ? string | undefined
		: T[P] extends readonly string[] ? T[P][number]
		: never
}

/**
 * @deprecated Use `QueryStringMatchResult`.
 */
export type ExactQueryMatchResult<U extends QueryMatch> = MatchResult<{
	query: QueryResult<U>
}>

/**
 * Match query params
 *
 * key is a string and value:
 * true: must be present
 * false: must be absent
 * undefined: optional
 * string[]: must be one of these exact values
 * @deprecated Use `queryString` with validators to match query parameters.
 */
export class ExactQueryMatcher<U extends QueryMatch, P extends ExactQueryMatcherInput>
	implements Matcher<ExactQueryMatchResult<U>, P> {
	private readonly listConfig: [string, readonly string[] | true | false | undefined][]
	constructor(config: U) {
		this.match = this.match.bind(this)
		this.listConfig = Object.entries(config)
	}

	match({ req }: P): ExactQueryMatchResult<U> {
		const search = getRequestSearch(req.url)
		const entries: [string, string][] = []
		for (const part of search.slice(1).split('&')) {
			if (part === '') {
				continue
			}
			const separator = part.indexOf('=')
			if (separator === -1) {
				entries.push([part, ''])
			} else {
				entries.push([part.slice(0, separator), part.slice(separator + 1)])
			}
		}

		const params = Object.fromEntries(entries)

		// validate query params
		for (const [key, value] of this.listConfig) {
			switch (value) {
				// key must be absent
				case false:
					if (Object.hasOwn(params, key)) {
						return {
							matched: false,
						}
					}
					break
				// key must be present with any value
				case true:
					if (!Object.hasOwn(params, key)) {
						return {
							matched: false,
						}
					}
					break
				// don't care about optional keys
				case undefined:
					break
				// assume string[] and therefore exact key and value
				default: {
					const paramsValue = Object.hasOwn(params, key) ? params[key] : undefined
					if (paramsValue === undefined || !value.includes(paramsValue)) {
						return {
							matched: false,
						}
					}
				}
			}
		}

		// everything is fine
		return {
			matched: true,
			result: {
				query: params as QueryResult<U>,
			},
		}
	}
}

/**
 * @deprecated Use `queryString` with validators to match query parameters.
 */
export function exactQuery<
	U extends QueryMatch,
	P extends ExactQueryMatcherInput,
>(config: U): ExactQueryMatcher<U, P> {
	return new ExactQueryMatcher(config)
}
