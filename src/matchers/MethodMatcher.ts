import {
	Matcher,
} from './Matcher'
import {
	MatchResult,
} from './MatchResult'

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
		const { method } = req
		if (method && this.methods.indexOf(method as Method) >= 0) {
			return {
				matched: true,
				result: {
					method: method as M[number],
				},
			}
		}

		return {
			matched: false,
		}
	}
}
