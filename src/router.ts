import {
	IncomingMessage,
	ServerResponse,
} from 'http'
import {
	MatchResult,
	Matched,
	Matcher,
	isMatched,
} from './matchers'

export type Handler<MR extends MatchResult, D = Matched<MR>> = (
	req: IncomingMessage,
	res: ServerResponse,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	data: D) => any

export type MatchedHandler<M extends Matcher> = Handler<ReturnType<M['match']>>

export interface Route<MR extends MatchResult> {
	matcher: Matcher<MR>
	handler: Handler<MR>
}

export class Router {
	private routes: Route<MatchResult>[] = []
	private noMatchHandler: Handler<MatchResult>

	constructor(noMatchHandler: Handler<MatchResult>) {
		this.noMatchHandler = noMatchHandler
	}

	readonly addRoute = <MR extends MatchResult>(route: Route<MR>): void => {
		this.routes.push(route as unknown as Route<MatchResult>)
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	readonly serve = (req: IncomingMessage, res: ServerResponse): ReturnType<Handler<any>> => {
		for (const route of this.routes) {
			const match = route.matcher.match(req, res)
			if (isMatched(match)) {
				return route.handler(req, res, match)
			}
		}

		return this.noMatchHandler(req, res, {
			matched: true,
		})
	}
}
