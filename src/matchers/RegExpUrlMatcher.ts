import {
	IncomingMessage,
} from 'http'
import {
	Matcher,
} from './Matcher'
import {
	MatchResult,
} from './MatchResult'

export interface RegExpExecGroupArray<
	T extends object
> extends Array<string> {
	index: number
	input: string
	groups: T
}

export type RegExpUrlMatchResult<R extends object> = MatchResult<{
	match: RegExpExecGroupArray<R>
}>

export class RegExpUrlMatcher<R extends object>
implements Matcher<RegExpUrlMatchResult<R>> {
	constructor(private readonly urls: [RegExp, ...RegExp[]]) {
	}

	match(req: IncomingMessage): RegExpUrlMatchResult<R> {
		if (req.url) {
			for (const url of this.urls) {
				const result = url.exec(req.url) as never as RegExpExecGroupArray<R>
				if (result !== null) {
					return {
						matched: true,
						match: result,
					}
				}
			}
		}

		return {
			matched: false,
		}
	}
}
