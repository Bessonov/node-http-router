import type {
	Matcher,
} from './Matcher.js'
import type {
	MatchResult,
} from './MatchResult.js'

const validMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'] as const

export interface MethodMatcherInput {
	req: {
		method: string
	}
}

export type Method = typeof validMethods[number]

export type MethodMatchResult<M extends Method[]> = MatchResult<{
	method: M[number]
}>

/**
 * Match methods
 */
export class MethodMatcher<
	M extends Method[],
	P extends MethodMatcherInput
> implements Matcher<MethodMatchResult<M>, P> {
	constructor(private readonly methods: M) {
		this.match = this.match.bind(this)
	}

	match({ req }: MethodMatcherInput): MethodMatchResult<M> {
		const { method: httpMethod } = req
		if (httpMethod && this.methods.indexOf(httpMethod as Method) >= 0) {
			return {
				matched: true,
				result: {
					method: httpMethod as M[number],
				},
			}
		}

		return {
			matched: false,
		}
	}
}

export function method<
	M extends Method[],
	P extends MethodMatcherInput
>(methods: M): MethodMatcher<M, P> {
	return new MethodMatcher(methods)
}
