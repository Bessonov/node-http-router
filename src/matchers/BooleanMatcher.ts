import type {
	Matcher,
} from './Matcher.js'
import type {
	MatchResult,
} from './MatchResult.js'

export class BooleanMatcher<T extends boolean> implements Matcher<MatchResult<T>, void> {
	constructor(private value: T) {
		this.match = this.match.bind(this)
	}

	match(): MatchResult<T> {
		if (this.value) {
			return {
				matched: true,
				result: true,
			} as MatchResult<T>
		}
		return {
			matched: false,
		}
	}
}

export function bool<T extends boolean>(value: T): BooleanMatcher<T> {
	return new BooleanMatcher(value)
}
