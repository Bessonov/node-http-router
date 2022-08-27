import {
	IncomingMessage,
	ServerResponse,
} from 'http'
import {
	ExactUrlPathnameMatcher,
} from '../../matchers'
import {
	NodeHttpRouter,
} from '../NodeHttpRouter'

it('missing method in request', () => {
	const nodeRouter = new NodeHttpRouter()
	expect(() => nodeRouter.serve({} as IncomingMessage, {} as ServerResponse)).toThrowError(`request missing 'method'`)
})

it('missing url in request', () => {
	const nodeRouter = new NodeHttpRouter()
	expect(() => nodeRouter.serve({ method: 'GET' } as IncomingMessage, {} as ServerResponse)).toThrowError(`request missing 'url'`)
})

it('default handler', () => {
	const nodeRouter = new NodeHttpRouter(({ data: { req } }) => {
		return `not found url: ${req.url}`
	})
	nodeRouter.addRoute({
		matcher: new ExactUrlPathnameMatcher(['/test']),
		handler: () => 'test url',
	})

	expect(nodeRouter.serve({ method: 'GET', url: '/test' } as IncomingMessage, {} as ServerResponse)).toBe('test url')
	expect(nodeRouter.serve({ method: 'GET', url: '/404' } as IncomingMessage, {} as ServerResponse)).toBe('not found url: /404')
})
