import {
	createRequest,
	createResponse,
} from 'node-mocks-http'
import {
	compile,
	pathToRegexp,
} from 'path-to-regexp'
import {
	Test,
} from 'ts-toolbelt'
import {
	MatchedHandler,
	Router,
} from '../Router'
import {
	AndMatcher,
	AndMatcherResult,
	EndpointMatcher,
	ExactUrlPathnameMatchResult,
	ExactUrlPathnameMatcher,
	Matched,
	Method,
	MethodMatchResult,
	MethodMatcher,
	RegExpUrlMatcher,
} from '../matchers'
import {
	ServerRequest,
} from '../node/ServerRequest'
import {
	MatchResult,
} from '../matchers/MatchResult'
import {
	Matcher,
} from '../matchers/Matcher'
import {
	BooleanMatcher,
} from '../matchers/BooleanMatcher'
import {
	NodeHttpRouter,
} from '../node/NodeHttpRouter'

let router: Router<{ req: ServerRequest }>

beforeEach(() => {
	router = new Router()
})

it('nothing matched', () => {
	expect(router.exec({ req: createRequest() })).toBe(undefined)
})

it('match not found route if no routes specified', () => {
	router.addRoute({
		matcher: new BooleanMatcher(true),
		handler: () => 'not found',
	})
	expect(router.exec({ req: createRequest() })).toBe('not found')
})

it('match method', () => {
	// example of usage, if matcher is defined first
	const matcher = new MethodMatcher(['GET', 'DELETE'])

	const handler: MatchedHandler<typeof matcher> = ({ match }) => {
		if (match.result.method === 'DELETE') {
			return 'matched DELETE'
		}
		return `matched ${match.result.method}`
	}

	router.addRoute({ matcher, handler })

	expect(router.exec({ req: createRequest() })).toBe('matched GET')
	expect(router.exec({ req: createRequest({ method: 'DELETE' }) })).toBe('matched DELETE')
})

it('no match for POST route', () => {
	router.addRoute({
		matcher: new MethodMatcher(['GET']),
		handler: () => 'matched GET',
	})
	router.addRoute({
		matcher: new BooleanMatcher(true),
		handler: () => 'not found',
	})

	const req = createRequest({
		method: 'POST',
	})

	expect(router.exec({ req })).toBe('not found')
})

it('match POST /test route', () => {
	// example of usage, if handler is defined first
	const handler = ({
		match,
	}: {
		match: Matched<AndMatcherResult<
		MethodMatchResult<[Method]>,
		ExactUrlPathnameMatchResult<[string]>
		>>
	}) => {
		const [{ result: { method } }, { result: { pathname } }] = match.result.and
		return `matched ${method} ${pathname}`
	}

	router.addRoute({
		matcher: new AndMatcher([
			new MethodMatcher(['POST']),
			new ExactUrlPathnameMatcher(['/test']),
		]),
		handler,
	})

	const req = createRequest({
		method: 'POST',
		url: '/test',
	})

	expect(router.exec({ req })).toBe('matched POST /test')
})

it('match POST /group/123 endpoint', () => {
	// define an endpoint
	const endpoint = ((pattern: string) => ({
		pattern: pathToRegexp(pattern),
		path: compile<{ groupId: number }>(pattern),
	}))('/group/:groupId')

	router.addRoute({
		matcher: new EndpointMatcher('POST', endpoint.pattern),
		handler: ({ match }) => {
			return `matched ${match.result.method} for group ${match.result.match[1]}`
		},
	})
	router.addRoute({
		matcher: new BooleanMatcher(true),
		handler: () => 'not found',
	})

	const req = createRequest({
		method: 'POST',
		url: endpoint.path({ groupId: 123 }),
	})

	expect(router.exec({ req })).toBe('matched POST for group 123')
	expect(router.exec({ req: createRequest() })).toBe('not found')
})

class TestMatcherWithParams<
	T extends MatchResult<void>,
	D extends { test: string }
> implements Matcher<T, D> {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars, class-methods-use-this
	match(neededForTypeScript: D): T {
		throw new Error('Method not implemented.')
	}
}

it('simple route match', () => {
	const routerWithoutParams = new Router()
	routerWithoutParams.addRoute<MatchResult<boolean>>({
		matcher: new BooleanMatcher(true),
		handler: params => {
			Test.checks([
				Test.check<typeof params, {
					data: unknown
					match: { matched: true; result: boolean }
				}, Test.Pass>(),
			])
			return 'test'
		},
	})
})

it('simple route match with custom type', () => {
	const typedRouter = new Router<{ test: string }>()
	typedRouter.addRoute({
		matcher: new TestMatcherWithParams(),
		handler: params => {
			Test.checks([
				Test.check<typeof params, {
					data: { test: string }
					match: { matched: true; result: void }
				}, Test.Pass>(),
			])
			return 'myreturn'
		},
	})
})

it('simple non-matching router type', () => {
	const typedRouter = new Router<{ test2: string }>()
	typedRouter.addRoute({
		// @ts-expect-error
		matcher: new TestMatcherWithParams(),
		handler: params => {
			Test.checks([
				Test.check<typeof params, {
					data: { test2: string }
					match: { matched: true; result: void }
				}, Test.Pass>(),
				Test.check<typeof params, {
					data: { test: string }
					match: { matched: true; result: void }
				}, Test.Fail>(),
			])
			return 'myreturn'
		},
	})
})

it('nested router', () => {
	const appRouter = new Router<{
		tenant: string
		req: ServerRequest
	}>()

	appRouter.addRoute({
		matcher: new RegExpUrlMatcher<{ name: string }>([/\/app\/(?<name>[\w\W]+)/]),
		handler: ({
			data: { tenant },
			match: { result: { match: { groups: { name } } } },
		}) => `myapp ${tenant} ${name}`,
	})

	appRouter.addRoute({
		matcher: new BooleanMatcher(true),
		handler: () => '404 app route',
	})

	const rootRouter = new NodeHttpRouter()
	rootRouter.addRoute({
		matcher: new RegExpUrlMatcher<{
			tenant: string
			url: string
		}>([/^\/auth\/realms\/(?<tenant>[^/]+)(?<url>.+)/]),
		handler: ({ data, match }) => {
			const { req } = data
			const { tenant, url } = match.result.match.groups
			req.url = url
			return appRouter.exec({
				tenant,
				req,
			})
		},
	})

	rootRouter.addRoute({
		matcher: new BooleanMatcher(true),
		handler: () => '404 tenant route',
	})

	expect(rootRouter.serve(
		createRequest({
			url: '/unknown',
		}),
		createResponse(),
	)).toBe('404 tenant route')

	expect(rootRouter.serve(
		createRequest({
			url: '/auth/realms/mytenant/app/test',
		}),
		createResponse(),
	)).toBe('myapp mytenant test')

	expect(rootRouter.serve(
		createRequest({
			url: '/auth/realms/mytenant/app',
		}),
		createResponse(),
	)).toBe('404 app route')
})

it('event processing', () => {
	type MyEvent = {
		name: 'test1'
	} | {
		name: 'test2'
	} | {
		name: 'invalid'
	}

	const eventRouter = new Router<MyEvent>()

	eventRouter.addRoute({
		matcher: {
			match(params: MyEvent): MatchResult<number> {
				const result = /^test(?<num>\d+)$/.exec(params.name)
				if (result?.groups?.num) {
					return {
						matched: true,
						result: parseInt(result.groups.num, 10),
					}
				}
				return {
					matched: false,
				}
			},
		},
		handler({ data, match: { result } }) {
			return `the event ${data.name} has number ${result}`
		},
	})

	eventRouter.addRoute({
		matcher: new BooleanMatcher(true),
		handler({ data }) {
			return `the event '${data.name}' is unknown`
		},
	})

	expect(eventRouter.exec({
		name: 'test1',
	})).toBe('the event test1 has number 1')

	expect(eventRouter.exec({
		name: 'invalid',
	})).toBe(`the event 'invalid' is unknown`)
})
