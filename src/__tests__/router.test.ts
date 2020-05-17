import {
	IncomingMessage, ServerResponse,
} from 'http'
import {
	createRequest, createResponse,
} from 'node-mocks-http'
import {
	compile, pathToRegexp,
} from 'path-to-regexp'
import {
	MatchedHandler, Router,
} from '../router'
import {
	AndMatcher, EndpointMatcher, ExactUrlPathnameMatcher,
	MethodMatcher,
} from '../matchers'


let router: Router

beforeEach(() => {
	router = new Router(() => 'not found')
})

it('match not found route if no routes specified', () => {
	expect(router.serve(createRequest(), createResponse())).toBe('not found')
})

it('match method', () => {
	// example of usage, if matcher is defined first
	const matcher = new MethodMatcher(['GET', 'DELETE'])

	const handler: MatchedHandler<typeof matcher> = (req, res, match) => {
		if (match.method === 'DELETE') {
			return 'matched DELETE'
		}
		return `matched ${match.method}`
	}

	router.addRoute({ matcher, handler })

	expect(router.serve(createRequest(), createResponse())).toBe('matched GET')
	expect(router.serve(createRequest({ method: 'DELETE' }), createResponse())).toBe('matched DELETE')
})

it('no match for POST route', () => {
	router.addRoute({
		matcher: new MethodMatcher(['GET']),
		handler: () => 'matched GET',
	})

	const request = createRequest({
		method: 'POST',
	})

	expect(router.serve(request, createResponse())).toBe('not found')
})

it('match POST /test route', () => {
	// example of usage, if handler is defined first
	const handler = (
		req: IncomingMessage,
		res: ServerResponse,
		match: {and: [{method: string}, {pathname: string}]},
	) => {
		const [{ method }, { pathname }] = match.and
		return `matched ${method} ${pathname}`
	}

	// fully typed:
	// const handler = (
	//     req: IncomingMessage,
	//     res: ServerResponse,
	//     match: Matched<AndMatcherResult<MethodMatchResult<[Method]>,
	//       ExactUrlPathnameMatchResult<[string]>>>) => {
	//   const [{ method }, { pathname }] = match.and
	//   return `matched ${method} ${pathname}`
	// }

	router.addRoute({
		matcher: new AndMatcher([
			new MethodMatcher(['POST']),
			new ExactUrlPathnameMatcher(['/test']),
		]),
		handler,
	})

	const request = createRequest({
		method: 'POST',
		url: '/test',
	})

	expect(router.serve(request, createResponse())).toBe('matched POST /test')
})

it('match POST /group/123 endpoint', () => {
	// define an endpoint
	const endpoint = ((pattern: string) => ({
		pattern: pathToRegexp(pattern),
		path: compile<{groupId: number}>(pattern),
	}))('/group/:groupId')

	router.addRoute({
		matcher: new EndpointMatcher('POST', endpoint.pattern),
		handler: (req, res, match) => {
			return `matched ${match.method} for group ${match.match[1]}`
		},
	})

	const request = createRequest({
		method: 'POST',
		url: endpoint.path({ groupId: 123 }),
	})

	expect(router.serve(request, createResponse())).toBe('matched POST for group 123')
	expect(router.serve(createRequest(), createResponse())).toBe('not found')
})
