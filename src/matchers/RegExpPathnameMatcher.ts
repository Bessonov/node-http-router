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
	getRequestPathname,
} from './parseRequestTarget.js'

export interface RegExpPathnameMatcherInput {
	req: {
		url: string
	}
}

export type RegExpPathnameMatch = Record<string, FirstValidator<string[] | undefined>>

export type RegExpPathnameResult<T extends RegExpPathnameMatch> = {
	url: string
	params: {
		[P in keyof T]: ValidatorReturnType<T[P]>
	}
}

export type RegExpPathnameMatchResult<R extends RegExpPathnameMatch> = MatchResult<{
	pathname: RegExpPathnameResult<R>
}>

class RegExpPathnameMatcher<
	R extends RegExpPathnameMatch,
	P extends RegExpPathnameMatcherInput = RegExpPathnameMatcherInput,
> implements Matcher<RegExpPathnameMatchResult<R>, P> {
	private readonly listConfig: {
		key: string
		validator: FirstValidator<string[] | undefined>
		index: number | undefined
	}[]
	private readonly patterns: RegExp[]

	constructor(urls: RegExp[], config?: R) {
		this.match = this.match.bind(this)
		this.listConfig = Object.entries(config ?? {}).map(([key, validator]) => ({
			key,
			validator,
			index: /^(?:0|[1-9]\d*)$/.test(key) ? Number(key) : undefined,
		}))
		this.patterns = urls.map(function copyPattern(url) {
			const flags = url.sticky && !url.global ? `${url.flags}g` : url.flags
			return new RegExp(url.source, flags)
		})
	}

	match({ req }: RegExpPathnameMatcherInput): RegExpPathnameMatchResult<R> {
		const pathname = getRequestPathname(req.url)
		if (this.listConfig.length === 0) {
			for (const pattern of this.patterns) {
				pattern.lastIndex = 0
				if (pattern.test(pathname)) {
					return {
						matched: true,
						result: { pathname: { url: pathname } },
					} as RegExpPathnameMatchResult<R>
				}
			}
			return { matched: false }
		}

		urlLoop: for (const pattern of this.patterns) {
			// matchAll advances after zero-width matches. A stateless pattern only needs one exec.
			const matches = pattern.global ? pathname.matchAll(pattern) : [pattern.exec(pathname)]
			let extractedValues: Record<string, string[]> | undefined
			for (const match of matches) {
				if (match === null) {
					break
				}
				extractedValues ??= Object.create(null) as Record<string, string[]>
				for (const { key, index } of this.listConfig) {
					const value = index === undefined ? match.groups?.[key] : match.at(index)
					if (value !== undefined) {
						extractedValues[key] ??= []
						extractedValues[key].push(value)
					}
				}
			}

			if (extractedValues === undefined) {
				continue
			}
			const entries: [string, unknown][] = []
			for (const { key, validator } of this.listConfig) {
				const getter = validator(extractedValues[key])
				if (getter === undefined) {
					continue urlLoop
				}
				entries.push([key, getter()])
			}

			return {
				matched: true,
				result: {
					pathname: {
						url: pathname,
						params: Object.fromEntries(entries) as RegExpPathnameResult<R>['params'],
					},
				},
			}
		}

		return {
			matched: false,
		}
	}
}

export function regExpPathname<
	R extends RegExpPathnameMatch,
	P extends RegExpPathnameMatcherInput = RegExpPathnameMatcherInput,
>(urls: RegExp[], config?: R): RegExpPathnameMatcher<R, P> {
	return new RegExpPathnameMatcher(urls, config)
}
