import Url from 'urlite'
import type {
	Validator,
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyValidator = Validator<string[], any>

type QueryMatch = Record<string, AnyValidator>

type QueryResult<T extends QueryMatch> = {
	[P in keyof T]: T[P] extends Validator<string[], infer O> ? O : never
}

export type QueryStringMatchResult<U extends QueryMatch> = MatchResult<{
	query: QueryResult<U>
}>

class QueryStringMatcher<
	U extends QueryMatch,
	P extends QueryStringMatcherInput,
> implements Matcher<QueryStringMatchResult<U>, P> {
	private readonly listConfig: [string, AnyValidator][]

	constructor(config: U) {
		this.listConfig = Object.entries(config)
	}

	match = ({ req }: P): QueryStringMatchResult<U> => {
		// original URL returns '' if search is empty
		const search = Url.parse(req.url).search ?? ''
		const queryParams = new URLSearchParams(search)

		const queryResult = {} as QueryResult<U>
		for (const [key, validatorFactory] of this.listConfig) {
			const validator = validatorFactory()
			const params = queryParams.getAll(key)
			if (validator.match(params) === false) {
				return {
					matched: false,
				}
			}
			// @ts-ignore
			queryResult[key] = validator.parse(params)
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
	U extends QueryMatch,
	P extends QueryStringMatcherInput,
>(config: U): QueryStringMatcher<U, P> {
	return new QueryStringMatcher(config)
}
