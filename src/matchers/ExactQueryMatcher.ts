import { IncomingMessage } from 'http'
import Url from 'urlite'
import { Matcher } from './Matcher'
import { MatchResult } from './MatchResult'

type QueryMatch = {[key: string]: string | true | false | undefined}

type QueryResult<T> = {
	[P in keyof T]:
	T[P] extends true ? string
		: T[P] extends false ? never
			: T[P] extends undefined ? string | undefined
				: T[P]
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
export class ExactQueryMatcher<U extends QueryMatch>
implements Matcher<ExactQueryMatchResult<U>> {
	private readonly listConfig: [string, string | true | false | undefined][]
	constructor(config: U) {
		this.listConfig = Object.entries(config)
	}

	match(req: IncomingMessage): ExactQueryMatchResult<U> {
		/* istanbul ignore else */
		if (req.url !== undefined) {
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
					// assume string and therefore exact key and value
					default:
						if (key in params === false || params[key] !== value) {
							return {
								matched: false,
							}
						}
				}
			}

			// everything is fine
			return {
				matched: true,
				query: params,
			}
		}

		/* istanbul ignore next */
		return {
			matched: false,
		}
	}
}
