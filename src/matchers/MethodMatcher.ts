import {
	IncomingMessage,
} from 'http'
import {
	Matcher,
} from './Matcher'
import {
	MatchResult,
} from './MatchResult'

const validMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'] as const

export type Method = typeof validMethods[number]

export type MethodMatchResult<M extends Method[]> = MatchResult<{
	method: M[number]
}>

/**
 * Match methods
 */
export class MethodMatcher<M extends Method[]> implements Matcher<MethodMatchResult<M>> {
	constructor(private readonly methods: M) {
	}

	match(req: IncomingMessage): MethodMatchResult<M> {
		const { method } = req
		if (method && this.methods.indexOf(method as Method) >= 0) {
			return {
				matched: true,
				method: method as M[number],
			}
		}

		return {
			matched: false,
		}
	}
}
