import { IncomingMessage } from 'http'
import { Matcher } from './Matcher'
import { MatchResult } from './MatchResult'

export type RegExpUrlMatchResult<R extends Partial<RegExpExecArray>> = MatchResult<{
	match: RegExpExecArray & R
}>

export class RegExpUrlMatcher<R extends Partial<RegExpExecArray>>
implements Matcher<RegExpUrlMatchResult<R>> {
	constructor(private readonly urls: [RegExp, ...RegExp[]]) {
	}

	match(req: IncomingMessage): RegExpUrlMatchResult<R> {
		if (req.url) {
			for (const url of this.urls) {
				const result = url.exec(req.url) as never as RegExpExecArray & R
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
