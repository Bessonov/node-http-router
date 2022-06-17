import Url from 'urlite'
import {
	Matcher,
} from './Matcher'
import {
	MatchResult,
} from './MatchResult'

export interface ExactQueryMatcherInput {
	req: {
		url: string
	}
}

type QueryMatch = { [key: string]: readonly string[] | true | false | undefined }

type QueryResult<T> = {
	[P in keyof T]:
	T[P] extends true ? string
		: T[P] extends false ? never
			: T[P] extends undefined ? string | undefined
				: T[P] extends readonly string[] ? T[P][number]
					: never
}

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
 * 'some string': must be exact value
 */
export class ExactQueryMatcher<U extends QueryMatch, P extends ExactQueryMatcherInput>
implements Matcher<ExactQueryMatchResult<U>, P> {
	private readonly listConfig: [string, readonly string[] | true | false | undefined][]
	constructor(config: U) {
		this.match = this.match.bind(this)
		this.listConfig = Object.entries(config)
	}

	match({ req }: P): ExactQueryMatchResult<U> {
		// original URL returns '' if search is empty
		const search = Url.parse(req.url).search ?? ''

		// parse query string into dict
		let params = {} as QueryResult<U>
		if (search !== '') {
			params = search.substring(1).split(/&/).reduce((acc, parts) => {
				const part = parts.split(/=/)
				const [key, value] = part
				// @ts-ignore
				acc[key] = value
				return acc
			}, params)
		}

		// validate query params
		for (const [key, value] of this.listConfig) {
			switch (value) {
				// key must be absent
				case false:
					if (key in params) {
						return {
							matched: false,
						}
					}
					break
				// key must be present with any value
				case true:
					if (key in params === false) {
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
					const paramsValue = params[key] as string | undefined
					if (!paramsValue || value.includes(paramsValue) === false) {
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
				query: params,
			},
		}
	}
}
