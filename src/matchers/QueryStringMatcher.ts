import Url from 'urlite'
import type {
	ObjectToArray,
} from '../TypeUtils.js'
import type {
	FirstValidator,
	ValidatorReturnType,
} from '../validators.js'
import type {
	Matcher,
} from './Matcher.js'
import type {
	MatchResult,
} from './MatchResult.js'

export interface QueryStringMatcherInput {
	req: {
		url: string
	}
}

export type QueryStringMatch = Record<string, FirstValidator<string[] | undefined>>

export type QueryStringResult<T extends QueryStringMatch> = {
	[P in keyof T]: ValidatorReturnType<T[P]>
}

export type QueryStringMatchResult<U extends QueryStringMatch> = MatchResult<{
	query: QueryStringResult<U>
}>

class QueryStringMatcher<
	U extends QueryStringMatch,
	P extends QueryStringMatcherInput,
> implements Matcher<QueryStringMatchResult<U>, P> {
	private readonly listConfig: ObjectToArray<QueryStringMatch>

	constructor(config: U) {
		this.listConfig = Object.entries(config)
	}

	match = ({ req }: P): QueryStringMatchResult<U> => {
		// original URL returns '' if search is empty
		const search = Url.parse(req.url).search ?? ''
		const queryParams = new URLSearchParams(search)

		const queryResult = {} as QueryStringResult<U>
		for (const [key, matcher] of this.listConfig) {
			const params = queryParams.has(key) ? queryParams.getAll(key) : undefined
			const getter = matcher(params)
			if (getter === undefined) {
				return {
					matched: false,
				}
			}
			// @ts-expect-error
			queryResult[key] = getter(params)
		}

		return {
			matched: true,
			result: {
				query: queryResult,
			},
		}
	}
}

export function queryString<
	U extends QueryStringMatch,
	P extends QueryStringMatcherInput,
>(config: U): QueryStringMatcher<U, P> {
	return new QueryStringMatcher(config)
}
