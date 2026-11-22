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
import {
	getRequestSearch,
} from './parseRequestTarget.js'

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
		this.match = this.match.bind(this)
		this.listConfig = Object.entries(config)
	}

	match({ req }: P): QueryStringMatchResult<U> {
		const search = getRequestSearch(req.url)
		const queryParams = search === '' ? undefined : new URLSearchParams(search)

		const entries: [string, unknown][] = []
		for (const [key, matcher] of this.listConfig) {
			const values = queryParams?.getAll(key)
			const params = values?.length ? values : undefined
			const getter = matcher(params)
			if (getter === undefined) {
				return {
					matched: false,
				}
			}
			const getValue: (values: typeof params) => unknown = getter
			entries.push([key, getValue(params)])
		}

		return {
			matched: true,
			result: {
				query: Object.fromEntries(entries) as QueryStringResult<U>,
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
