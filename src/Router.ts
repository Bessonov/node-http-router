import {
	Matched,
	Matcher,
	isMatched,
} from './matchers'
import {
	MatchResultAny,
} from './matchers/MatchResult'

interface HandlerParams<MR extends MatchResultAny, D> {
	match: Matched<MR>
	data: D
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MatchedHandler<M extends Matcher<MatchResultAny, any>, D = any> = Handler<ReturnType<M['match']>, D>

export type Handler<
	MR extends MatchResultAny,
	D,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
> = (params: HandlerParams<MR, D>) => any

export interface Route<MR extends MatchResultAny, D> {
	matcher: Matcher<MR, D>
	handler: Handler<MR, D>
}

export class Router<D> {
	private routes: Route<MatchResultAny, D>[] = []

	constructor() {
		this.addRoute = this.addRoute.bind(this)
		this.exec = this.exec.bind(this)
	}

	addRoute<MR extends MatchResultAny>(route: Route<MR, D>): void {
		this.routes.push(route as unknown as Route<MatchResultAny, D>)
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	exec(params: D): ReturnType<Handler<any, D>> {
		for (const route of this.routes) {
			const match = route.matcher.match(params)
			if (isMatched(match)) {
				return route.handler({
					data: params,
					match,
				})
			}
		}
		return undefined
	}
}
