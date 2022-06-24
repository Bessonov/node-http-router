import {
	MatchResult,
} from './MatchResult'
import {
	Matcher,
} from './Matcher'

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
