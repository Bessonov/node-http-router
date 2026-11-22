import type {
	ServerResponse,
} from 'http'
import {
	createRequest,
	createResponse,
} from 'node-mocks-http'
import {
	compile,
	pathToRegexp,
} from 'path-to-regexp'
import {
	and,
	type AndMatcherResult,
	bool,
	endpoint,
	exactUrlPathname,
	type ExactUrlPathnameMatchResult,
	type Matched,
	type Matcher,
	type MatchResult,
	type Method,
	method,
	type MethodMatchResult,
	regExpPathname,
} from '../matchers/index.js'
import {
	NodeHttpRouter,
} from '../node/NodeHttpRouter.js'
import type {
	ServerRequest,
} from '../node/ServerRequest.js'
import {
	type MatchedHandler,
	Router,
} from '../Router.js'
import {
	chain,
	getNthVal,
	requiredVal,
} from '../validators.js'

let router: Router<{ req: ServerRequest }>

beforeEach(() => {
	router = new Router()
})

it('nothing matched', () => {
	expect(router.exec({ req: createRequest() })).toBe(undefined)
})

it('match not found route if no routes specified', () => {
	router.addRoute({
		matcher: bool(true),
		handler: () => 'not found',
	})
	expect(router.exec({ req: createRequest() })).toBe('not found')
})

it('match method', () => {
	// example of usage, if matcher is defined first
	const matcher = method(['GET', 'DELETE'])

	const handler: MatchedHandler<typeof matcher> = function handleMethod({ match }) {
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
		matcher: method(['GET']),
		handler: () => 'matched GET',
	})
	router.addRoute({
		matcher: bool(true),
		handler: () => 'not found',
	})

	const req = createRequest({
		method: 'POST',
	})

	expect(router.exec({ req })).toBe('not found')
})

it('match POST /test route', () => {
	// example of usage, if handler is defined first
	function handler({
		match,
	}: {
		match: Matched<
			AndMatcherResult<
				MethodMatchResult<[Method]>,
				ExactUrlPathnameMatchResult<[string]>
			>
		>
	}) {
		const [{ result: { method: methodResult } }, { result: { pathname } }] = match.result.and
		return `matched ${methodResult} ${pathname}`
	}

	router.addRoute({
		matcher: and([
			method(['POST']),
			exactUrlPathname(['/test']),
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
	const pattern = '/group/:groupId'
	const { regexp } = pathToRegexp(pattern)
	const path = compile(pattern)

	router.addRoute({
		matcher: endpoint('POST', regexp, {
			url: {
				1: chain(getNthVal(), requiredVal()),
			},
		}),
		handler: ({ match }) => {
			return `matched ${match.result.method} for group ${match.result.pathname.params[1]}`
		},
	})
	router.addRoute({
		matcher: bool(true),
		handler: () => 'not found',
	})

	const req = createRequest({
		method: 'POST',
		url: path({ groupId: '123' }),
	})

	expect(router.exec({ req })).toBe('matched POST for group 123')
	expect(router.exec({ req: createRequest() })).toBe('not found')
})

it('no match, but default handler', () => {
	router = new Router(() => 'default route')
	const req = createRequest({
		method: 'POST',
		url: '/dontcare',
	})

	expect(router.exec({ req })).toBe('default route')
})

class TestMatcherWithParams<
	T extends MatchResult<void>,
	D extends { test: string },
> implements Matcher<T, D> {
	// eslint-disable-next-line class-methods-use-this
	match(_neededForTypeScript: D): T {
		throw new Error('Method not implemented.')
	}
}

it('simple route match', () => {
	const routerWithoutParams = new Router()
	interface TypeCheckPass {
		data: unknown
		match: { matched: true; result: boolean }
	}
	routerWithoutParams.addRoute<MatchResult<boolean>>({
		matcher: bool(true),
		handler: (_params: TypeCheckPass) => {
			return 'test'
		},
	})
})

it('simple route match with custom type', () => {
	const typedRouter = new Router<{ test: string }>()

	interface TypeCheckPass {
		data: { test: string }
		match: { matched: true; result: void }
	}

	typedRouter.addRoute({
		matcher: new TestMatcherWithParams(),
		handler: (_params: TypeCheckPass) => {
			return 'myreturn'
		},
	})
})

it('simple non-matching router type', () => {
	const typedRouter = new Router<{ test2: string }>()

	interface TypeCheckPass {
		data: { test2: string }
		match: { matched: true; result: void }
	}

	interface TypeCheckFail {
		data: { test: string }
		match: { matched: true; result: void }
	}

	typedRouter.addRoute({
		// @ts-expect-error
		matcher: new TestMatcherWithParams(),
		handler: (_params: TypeCheckPass) => {
			// @ts-expect-error
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const fail: TypeCheckFail = _params
			return 'myreturn'
		},
	})
})

it('tenant router example from docs', () => {
	// create main rooter
	const rootRouter = new NodeHttpRouter()
	// attach some global urls
	// rootRouter.addRoute(...)

	// create a router used for all handlers
	// with tenant information
	const tenantRouter = new Router<{
		req: ServerRequest
		res: ServerResponse
		tenant: string
	}>()

	// connect routers
	rootRouter.addRoute({
		matcher: regExpPathname([/^\/auth\/realms\/(?<tenant>[^/]+)(?<url>.+)/], {
			tenant: chain(getNthVal(), requiredVal()),
			url: chain(getNthVal(), requiredVal()),
		}),
		handler: ({ data, match }) => {
			const { req, res } = data
			// figure tenant out
			const { tenant, url } = match.result.pathname.params
			// pass the new url down
			req.url = url
			return tenantRouter.exec({
				req,
				res,
				tenant,
			})
		},
	})

	// attach some urls behind tenant
	tenantRouter.addRoute({
		matcher: exactUrlPathname(['/myurl']),
		handler: ({ data: { tenant }, match: { result: { pathname } } }) => {
			// if requested url is `/auth/realms/mytenant/myurl`, then:
			// tenant: mytenant
			// pathname: /myurl
			return `tenant: ${tenant}, url: ${pathname}`
		},
	})

	expect(rootRouter.serve(
		createRequest({
			method: 'GET',
			url: '/auth/realms/mytenant/myurl',
		}),
		createResponse(),
	)).toBe('tenant: mytenant, url: /myurl')
})

it('nested router', () => {
	const appRouter = new Router<{
		tenant: string
		req: ServerRequest
	}>()

	appRouter.addRoute({
		matcher: regExpPathname([/\/app\/(?<name>[\w\W]+)/], {
			name: chain(getNthVal(), requiredVal()),
		}),
		handler: ({
			data: { tenant },
			match: { result: { pathname: { params: { name } } } },
		}) => `myapp ${tenant} ${name}`,
	})

	appRouter.addRoute({
		matcher: bool(true),
		handler: () => '404 app route',
	})

	const rootRouter = new NodeHttpRouter()
	rootRouter.addRoute({
		matcher: regExpPathname([/^\/auth\/realms\/(?<tenant>[^/]+)(?<url>.+)/], {
			tenant: chain(getNthVal(), requiredVal()),
			url: chain(getNthVal(), requiredVal()),
		}),
		handler: ({ data, match }) => {
			const { req } = data
			const { tenant, url } = match.result.pathname.params
			req.url = url
			return appRouter.exec({
				tenant,
				req,
			})
		},
	})

	rootRouter.addRoute({
		matcher: bool(true),
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
		matcher: bool(true),
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
